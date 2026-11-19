package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class SessionCookieSecureConfigTest {

  @Test
  void renderSetsSecureWithoutChangingSameSite() throws Exception {
    String render = Files.readString(Path.of("..", "render.yaml"));
    String app = Files.readString(Path.of("src/main/resources/application.properties"));

    assertTrue(render.contains("key: SESSION_COOKIE_SECURE"));
    assertTrue(render.contains("value: \"true\""));
    assertFalse(render.toLowerCase().contains("samesite=none"));
    assertFalse(render.contains("key: SESSION_COOKIE_SAME_SITE"));

    assertTrue(app.contains("server.servlet.session.cookie.secure=${SESSION_COOKIE_SECURE:false}"));
    assertTrue(app.contains("server.servlet.session.cookie.http-only=true"));
    assertTrue(app.contains("server.servlet.session.cookie.same-site=${SESSION_COOKIE_SAME_SITE:lax}"));
  }
}
