package com.karim.portfolio;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Sliding-window rate limit for {@code POST /api/admin/login}.
 * Single-instance only.
 */
@Component
public class AdminLoginRateLimiter {

  private final int maxRequests;
  private final long windowMs;
  private final Map<String, Deque<Long>> hitsByClient = new ConcurrentHashMap<>();

  public AdminLoginRateLimiter(
      @Value("${admin.login.rate-limit.requests:10}") int maxRequests,
      @Value("${admin.login.rate-limit.window-ms:60000}") long windowMs) {
    this.maxRequests = Math.max(1, maxRequests);
    this.windowMs = Math.max(1_000L, windowMs);
  }

  public boolean tryAcquire(String clientKey) {
    long now = System.currentTimeMillis();
    Deque<Long> hits = hitsByClient.computeIfAbsent(clientKey, ignored -> new ArrayDeque<>());
    synchronized (hits) {
      while (!hits.isEmpty() && now - hits.peekFirst() >= windowMs) {
        hits.removeFirst();
      }
      if (hits.size() >= maxRequests) {
        return false;
      }
      hits.addLast(now);
      return true;
    }
  }

  void reset() {
    hitsByClient.clear();
  }
}
