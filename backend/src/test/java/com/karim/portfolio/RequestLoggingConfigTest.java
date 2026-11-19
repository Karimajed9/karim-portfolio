package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

class RequestLoggingConfigTest {

  @Test
  void requestLogOmitsSessionIdBearerAndPassword() throws Exception {
    CommonsRequestLoggingFilter filter = new RequestLoggingConfig().requestLoggingFilter();
    Logger logger = (Logger) LoggerFactory.getLogger(CommonsRequestLoggingFilter.class);
    Level previous = logger.getLevel();
    ListAppender<ILoggingEvent> appender = new ListAppender<>();
    appender.start();
    logger.addAppender(appender);
    logger.setLevel(Level.DEBUG);
    try {
      MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/admin/login");
      request.setSession(new MockHttpSession(null, "SESSION-SHOULD-NOT-LOG"));
      request.addHeader("Authorization", "Bearer secret-token-should-not-log");
      request.setContentType("application/json");
      request.setContent("{\"password\":\"secret-pass-should-not-log\"}".getBytes(StandardCharsets.UTF_8));

      filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> { });

      String logs = appender.list.stream()
          .map(ILoggingEvent::getFormattedMessage)
          .reduce("", (left, right) -> left + "\n" + right);
      assertFalse(logs.isBlank());
      assertFalse(logs.contains("SESSION-SHOULD-NOT-LOG"));
      assertFalse(logs.contains("secret-token-should-not-log"));
      assertFalse(logs.contains("secret-pass-should-not-log"));
      assertTrue(logs.contains("/api/admin/login"));
    } finally {
      logger.detachAppender(appender);
      logger.setLevel(previous);
    }
  }

  @Test
  void productionDoesNotEnableDebugRequestLogging() throws Exception {
    String properties = Files.readString(Path.of("src/main/resources/application.properties"));
    assertTrue(properties.contains(
        "logging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=INFO"));
    assertFalse(properties.contains(
        "logging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG"));
  }
}
