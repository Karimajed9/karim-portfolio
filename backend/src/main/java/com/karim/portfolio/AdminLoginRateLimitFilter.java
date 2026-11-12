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
@Order(Ordered.HIGHEST_PRECEDENCE + 15)
public class AdminLoginRateLimitFilter extends OncePerRequestFilter {

  private final AdminLoginRateLimiter rateLimiter;

  public AdminLoginRateLimitFilter(AdminLoginRateLimiter rateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return !(HttpMethod.POST.matches(request.getMethod())
        && path != null
        && path.endsWith("/api/admin/login"));
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String clientKey = ContactRateLimitFilter.clientKey(request);
    if (!rateLimiter.tryAcquire(clientKey)) {
      response.setStatus(429);
      response.setHeader("Retry-After", "60");
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write("{\"error\":\"Too many requests\"}");
      return;
    }
    filterChain.doFilter(request, response);
  }
}
