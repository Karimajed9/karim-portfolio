package com.karim.portfolio;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class ContactRateLimitFilter extends OncePerRequestFilter {

  private final ContactRateLimiter rateLimiter;

  public ContactRateLimitFilter(ContactRateLimiter rateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return !(HttpMethod.POST.matches(request.getMethod()) && path != null && path.endsWith("/api/contact"));
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String clientKey = clientKey(request);
    if (!rateLimiter.tryAcquire(clientKey)) {
      response.setStatus(429);
      response.setHeader("Retry-After", "60");
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write("{\"error\":\"Only one contact message per minute. Try again shortly.\"}");
      return;
    }
    filterChain.doFilter(request, response);
  }

  /**
   * Client address for login lockout and rate limits.
   * A proxy appends the address it actually saw, so the rightmost hop is used.
   * The leftmost value is client-supplied and must not pick a fresh bucket.
   */
  static String clientKey(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      String[] parts = forwarded.split(",");
      for (int i = parts.length - 1; i >= 0; i--) {
        String hop = parts[i].trim();
        if (!hop.isEmpty()) {
          return hop;
        }
      }
    }
    String remote = request.getRemoteAddr();
    return remote == null || remote.isBlank() ? "unknown" : remote;
  }
}
