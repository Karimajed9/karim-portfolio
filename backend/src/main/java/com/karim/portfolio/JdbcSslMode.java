package com.karim.portfolio;

import java.util.Locale;

/**
 * Neon rejects non-TLS connections. Remote Neon JDBC URLs must use
 * {@code sslmode=require}. Local and Compose URLs are left unchanged, and the
 * host is never hardcoded here.
 */
final class JdbcSslMode {

  private JdbcSslMode() {}

  static String requireForNeon(String jdbcUrl) {
    if (jdbcUrl == null || jdbcUrl.isBlank() || !isNeonHost(jdbcUrl)) {
      return jdbcUrl;
    }
    return withSslModeRequire(jdbcUrl);
  }

  private static boolean isNeonHost(String jdbcUrl) {
    String host = host(jdbcUrl);
    return "neon.tech".equals(host) || host.endsWith(".neon.tech");
  }

  static String host(String jdbcUrl) {
    String rest = jdbcUrl;
    int scheme = rest.indexOf("://");
    if (scheme >= 0) {
      rest = rest.substring(scheme + 3);
    }
    int end = rest.length();
    int slash = rest.indexOf('/');
    int query = rest.indexOf('?');
    if (slash >= 0) {
      end = Math.min(end, slash);
    }
    if (query >= 0) {
      end = Math.min(end, query);
    }
    rest = rest.substring(0, end);
    int at = rest.lastIndexOf('@');
    if (at >= 0) {
      rest = rest.substring(at + 1);
    }
    if (rest.startsWith("[")) {
      int bracket = rest.indexOf(']');
      return bracket >= 0 ? rest.substring(1, bracket).toLowerCase(Locale.ROOT) : rest.toLowerCase(Locale.ROOT);
    }
    int colon = rest.indexOf(':');
    if (colon >= 0) {
      rest = rest.substring(0, colon);
    }
    return rest.toLowerCase(Locale.ROOT);
  }

  private static String withSslModeRequire(String url) {
    int queryStart = url.indexOf('?');
    String base = queryStart < 0 ? url : url.substring(0, queryStart);
    String query = queryStart < 0 ? "" : url.substring(queryStart + 1);
    StringBuilder rewritten = new StringBuilder();
    boolean found = false;
    if (!query.isEmpty()) {
      for (String part : query.split("&", -1)) {
        if (part.isEmpty()) {
          continue;
        }
        int eq = part.indexOf('=');
        String key = eq >= 0 ? part.substring(0, eq) : part;
        if ("sslmode".equalsIgnoreCase(key)) {
          found = true;
          part = "sslmode=require";
        }
        if (rewritten.length() > 0) {
          rewritten.append('&');
        }
        rewritten.append(part);
      }
    }
    if (!found) {
      if (rewritten.length() > 0) {
        rewritten.append('&');
      }
      rewritten.append("sslmode=require");
    }
    return base + "?" + rewritten;
  }
}
