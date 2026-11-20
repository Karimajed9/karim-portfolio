package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

class JdbcSslModeTest {

  @Test
  void neonUrlGainsSslModeRequire() {
    assertEquals(
        "jdbc:postgresql://ep-example.us-east-2.aws.neon.tech/portfolio?sslmode=require",
        JdbcSslMode.requireForNeon("jdbc:postgresql://ep-example.us-east-2.aws.neon.tech/portfolio"));
  }

  @Test
  void neonUrlKeepsExistingQueryAndReplacesOtherSslMode() {
    assertEquals(
        "jdbc:postgresql://ep-example.us-east-2.aws.neon.tech:5432/portfolio?channel_binding=require&sslmode=require",
        JdbcSslMode.requireForNeon(
            "jdbc:postgresql://ep-example.us-east-2.aws.neon.tech:5432/portfolio?channel_binding=require&sslmode=disable"));
  }

  @Test
  void localAndComposeUrlsStayUnchanged() {
    String local = "jdbc:postgresql://localhost:5432/portfolio";
    String compose = "jdbc:postgresql://postgres:5432/portfolio";
    assertEquals(local, JdbcSslMode.requireForNeon(local));
    assertEquals(compose, JdbcSslMode.requireForNeon(compose));
  }

  @Test
  void processorRewritesOnlyNeonUrls() {
    StandardEnvironment neon = environment("jdbc:postgresql://ep-example.aws.neon.tech/portfolio");
    new NeonJdbcSslEnvironmentPostProcessor().postProcessEnvironment(neon, new SpringApplication());
    assertEquals(
        "jdbc:postgresql://ep-example.aws.neon.tech/portfolio?sslmode=require",
        neon.getProperty("spring.datasource.url"));

    StandardEnvironment local = environment("jdbc:postgresql://localhost:5432/portfolio");
    new NeonJdbcSslEnvironmentPostProcessor().postProcessEnvironment(local, new SpringApplication());
    assertEquals("jdbc:postgresql://localhost:5432/portfolio", local.getProperty("spring.datasource.url"));
    assertFalse(local.getPropertySources().contains(NeonJdbcSslEnvironmentPostProcessor.PROPERTY_SOURCE));
  }

  @Test
  void renderKeepsDatabaseAndStopsWiringTheApiToIt() throws Exception {
    String render = Files.readString(Path.of("..", "render.yaml")).replace("\r\n", "\n");
    String app = Files.readString(Path.of("src/main/resources/application.properties"));

    assertTrue(render.contains("name: karim-portfolio-db"));
    assertFalse(render.contains("fromDatabase"));
    assertTrue(render.contains(
        "- key: SPRING_DATASOURCE_URL\n        sync: false\n"
            + "      - key: SPRING_DATASOURCE_USERNAME\n        sync: false\n"
            + "      - key: DB_PASSWORD\n        sync: false"));
    assertFalse(render.contains("key: DB_HOST"));
    assertFalse(render.contains("key: DB_PORT"));
    assertFalse(render.contains("key: DB_NAME"));

    assertTrue(app.contains("spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:portfolio}"));
    assertTrue(app.contains("spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}"));
    assertTrue(app.contains("spring.datasource.password=${DB_PASSWORD}"));

    String registered = Files.readString(Path.of(
        "src/main/resources/META-INF/spring/org.springframework.boot.EnvironmentPostProcessor.imports"));
    assertTrue(registered.contains("com.karim.portfolio.NeonJdbcSslEnvironmentPostProcessor"));
  }

  private static StandardEnvironment environment(String url) {
    StandardEnvironment environment = new StandardEnvironment();
    environment.getPropertySources().addFirst(new MapPropertySource("test", Map.of("spring.datasource.url", url)));
    return environment;
  }
}
