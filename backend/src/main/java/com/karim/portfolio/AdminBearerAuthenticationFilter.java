package com.karim.portfolio;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Accepts the login bearer when the browser did not store the session cookie.
 * Registered inside the security chain (before CSRF) and not as a servlet filter.
 */
public class AdminBearerAuthenticationFilter extends OncePerRequestFilter {

  static final String AUTHENTICATED = "com.karim.portfolio.adminBearer";

  private final AdminSessionTokens tokens;
  private final AdminCredentials credentials;

  public AdminBearerAuthenticationFilter(AdminSessionTokens tokens, AdminCredentials credentials) {
    this.tokens = tokens;
    this.credentials = credentials;
  }

  static String bearerToken(HttpServletRequest request) {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header == null) {
      return null;
    }
    String prefix = "Bearer ";
    if (header.length() <= prefix.length() || !header.regionMatches(true, 0, prefix, 0, prefix.length())) {
      return null;
    }
    String token = header.substring(prefix.length()).trim();
    return token.isEmpty() ? null : token;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String token = bearerToken(request);
    if (token != null && tokens.isValid(token)) {
      request.setAttribute(AUTHENTICATED, Boolean.TRUE);
      SecurityContext context = SecurityContextHolder.getContext();
      if (context.getAuthentication() == null || !context.getAuthentication().isAuthenticated()) {
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                credentials.username(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContext replacement = SecurityContextHolder.createEmptyContext();
        replacement.setAuthentication(authentication);
        SecurityContextHolder.setContext(replacement);
      }
    }
    filterChain.doFilter(request, response);
  }
}
