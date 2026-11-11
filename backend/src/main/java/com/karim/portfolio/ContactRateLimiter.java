package com.karim.portfolio;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Simple in-memory sliding-window rate limiter for contact POSTs.
 * Suitable for a single-instance deploy; not shared across replicas.
 */
@Component
public class ContactRateLimiter {

  private final int maxRequests;
  private final long windowMs;
  private final Map<String, Deque<Long>> hitsByClient = new ConcurrentHashMap<>();

  public ContactRateLimiter(
      @Value("${contact.rate-limit.requests:5}") int maxRequests,
      @Value("${contact.rate-limit.window-ms:60000}") long windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * @return {@code true} if the request is allowed; {@code false} if rate-limited
   */
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

  /** Test helper: clear all tracked clients. */
  void reset() {
    hitsByClient.clear();
  }
}
