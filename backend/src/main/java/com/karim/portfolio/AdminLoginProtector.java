package com.karim.portfolio;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Failed-attempt lockout for admin login (per client key, typically IP).
 * Single-instance in-memory store — fine for one API replica.
 */
@Component
public class AdminLoginProtector {

  private final int maxFailedAttempts;
  private final long lockoutMs;
  private final Map<String, FailureState> failures = new ConcurrentHashMap<>();

  public AdminLoginProtector(
      @Value("${admin.login.max-failed-attempts:5}") int maxFailedAttempts,
      @Value("${admin.login.lockout-ms:900000}") long lockoutMs) {
    this.maxFailedAttempts = Math.max(1, maxFailedAttempts);
    this.lockoutMs = Math.max(1_000L, lockoutMs);
  }

  /** {@code true} if this client is currently locked out. */
  public boolean isLocked(String clientKey) {
    FailureState state = failures.get(clientKey);
    if (state == null) {
      return false;
    }
    synchronized (state) {
      if (state.lockedUntilMs == 0L) {
        return false;
      }
      long now = System.currentTimeMillis();
      if (now >= state.lockedUntilMs) {
        failures.remove(clientKey, state);
        return false;
      }
      return true;
    }
  }

  public void recordFailure(String clientKey) {
    FailureState state = failures.computeIfAbsent(clientKey, ignored -> new FailureState());
    synchronized (state) {
      long now = System.currentTimeMillis();
      if (state.lockedUntilMs > 0L && now < state.lockedUntilMs) {
        return;
      }
      if (state.lockedUntilMs > 0L && now >= state.lockedUntilMs) {
        state.failedAttempts = 0;
        state.lockedUntilMs = 0L;
      }
      state.failedAttempts++;
      if (state.failedAttempts >= maxFailedAttempts) {
        state.lockedUntilMs = now + lockoutMs;
        state.failedAttempts = 0;
      }
    }
  }

  public void recordSuccess(String clientKey) {
    failures.remove(clientKey);
  }

  /** Test helper. */
  void reset() {
    failures.clear();
  }

  private static final class FailureState {
    int failedAttempts;
    long lockedUntilMs;
  }
}
