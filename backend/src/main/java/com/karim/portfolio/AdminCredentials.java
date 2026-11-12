package com.karim.portfolio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Admin identity from environment. {@code ADMIN_PASSWORD} is required — no default.
 * The raw password is BCrypt-encoded once at startup.
 */
@Component
public class AdminCredentials {

  private final String username;
  private final String passwordHash;

  public AdminCredentials(
      @Value("${ADMIN_USERNAME:admin}") String username,
      @Value("${ADMIN_PASSWORD:}") String rawPassword,
      PasswordEncoder passwordEncoder) {
    if (!StringUtils.hasText(rawPassword)) {
      throw new IllegalStateException(
          "ADMIN_PASSWORD must be set (no default). Refusing to start without an admin password.");
    }
    this.username = username == null || username.isBlank() ? "admin" : username.trim();
    this.passwordHash = passwordEncoder.encode(rawPassword);
  }

  public String username() {
    return username;
  }

  public String passwordHash() {
    return passwordHash;
  }
}
