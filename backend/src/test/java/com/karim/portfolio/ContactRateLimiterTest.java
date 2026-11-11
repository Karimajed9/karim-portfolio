package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ContactRateLimiterTest {

  @Test
  void allowsOneThenBlocksWithinWindow() {
    ContactRateLimiter limiter = new ContactRateLimiter(1, 60_000);

    assertTrue(limiter.tryAcquire("1.2.3.4"), "first request should pass");
    assertFalse(limiter.tryAcquire("1.2.3.4"), "second request should be rate-limited");
  }

  @Test
  void tracksClientsIndependently() {
    ContactRateLimiter limiter = new ContactRateLimiter(1, 60_000);

    assertTrue(limiter.tryAcquire("a"));
    assertFalse(limiter.tryAcquire("a"));
    assertTrue(limiter.tryAcquire("b"));
  }
}
