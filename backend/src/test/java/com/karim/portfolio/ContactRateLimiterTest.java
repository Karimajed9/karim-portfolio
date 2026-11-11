package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ContactRateLimiterTest {

  @Test
  void allowsUpToLimitThenBlocks() {
    ContactRateLimiter limiter = new ContactRateLimiter(5, 60_000);

    for (int i = 0; i < 5; i++) {
      assertTrue(limiter.tryAcquire("1.2.3.4"), "request " + (i + 1) + " should pass");
    }
    assertFalse(limiter.tryAcquire("1.2.3.4"), "6th request should be rate-limited");
  }

  @Test
  void tracksClientsIndependently() {
    ContactRateLimiter limiter = new ContactRateLimiter(1, 60_000);

    assertTrue(limiter.tryAcquire("a"));
    assertFalse(limiter.tryAcquire("a"));
    assertTrue(limiter.tryAcquire("b"));
  }
}
