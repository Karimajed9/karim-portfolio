package com.karim.portfolio;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

/**
 * Basic HTTP request logging (method, URI, query). Always on locally.
 * When {@code APPLICATIONINSIGHTS_CONNECTION_STRING} is set, the Java agent
 * also ships request/dependency telemetry (see {@code applicationinsights.json}).
 */
@Configuration
public class RequestLoggingConfig {

  @Bean
  CommonsRequestLoggingFilter requestLoggingFilter() {
    CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
    filter.setIncludeQueryString(true);
    // Client info includes the session id. Leave it off so logs cannot replay a session.
    filter.setIncludeClientInfo(false);
    filter.setIncludeHeaders(false);
    filter.setIncludePayload(false);
    filter.setBeforeMessagePrefix("HTTP ");
    return filter;
  }
}
