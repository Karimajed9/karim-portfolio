package com.karim.portfolio;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * In-memory admin bearer tokens for browsers that drop the cross-site session
 * cookie (Safari). The token is returned once in the login JSON and sent back
 * as {@code Authorization: Bearer}. It is not a cookie, so third-party cookie
 * blocking does not apply. Single API instance, same assumption as login lockout.
 */
@Component
public class AdminSessionTokens {

  private final long ttlMs;
  private final SecureRandom random = new SecureRandom();
  private final Map<String, Long> expiryByHash = new ConcurrentHashMap<>();

  public AdminSessionTokens(
      @Value("${server.servlet.session.timeout:30m}") Duration timeout) {
    long millis = timeout == null ? Duration.ofMinutes(30).toMillis() : timeout.toMillis();
    this.ttlMs = Math.max(60_000L, millis);
  }

  public String issue() {
    byte[] raw = new byte[32];
    random.nextBytes(raw);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
    expiryByHash.put(hash(token), System.currentTimeMillis() + ttlMs);
    return token;
  }

  public boolean isValid(String token) {
    if (token == null || token.isBlank()) {
      return false;
    }
    String key = hash(token.trim());
    Long expiry = expiryByHash.get(key);
    if (expiry == null) {
      return false;
    }
    long now = System.currentTimeMillis();
    if (now >= expiry) {
      expiryByHash.remove(key, expiry);
      return false;
    }
    expiryByHash.put(key, now + ttlMs);
    return true;
  }

  public void revoke(String token) {
    if (token == null || token.isBlank()) {
      return;
    }
    expiryByHash.remove(hash(token.trim()));
  }

  private static String hash(String token) {
    try {
      byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 unavailable", e);
    }
  }
}
