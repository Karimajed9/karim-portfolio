package com.karim.portfolio;

import java.util.Map;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * When {@code SPRING_DATASOURCE_URL} points at Neon, force {@code sslmode=require}
 * before the datasource is created. The local {@code DB_HOST}/{@code DB_PORT}/{@code DB_NAME}
 * fallback never enters this path.
 */
public class NeonJdbcSslEnvironmentPostProcessor implements EnvironmentPostProcessor {

  static final String PROPERTY_SOURCE = "neonJdbcSsl";

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    String url = environment.getProperty("spring.datasource.url");
    if (url == null || url.isBlank()) {
      return;
    }
    String secured = JdbcSslMode.requireForNeon(url);
    if (secured.equals(url)) {
      return;
    }
    environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE, Map.of("spring.datasource.url", secured)));
  }
}
