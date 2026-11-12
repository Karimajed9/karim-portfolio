package com.karim.portfolio;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;

@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * Disables Boot's generated default user. Admin login uses {@link AdminCredentials}
   * + {@link AdminAuthController}, not DaoAuthenticationProvider.
   */
  @Bean
  UserDetailsService userDetailsService() {
    return username -> {
      throw new UsernameNotFoundException(username);
    };
  }

  @Bean
  CsrfTokenRepository csrfTokenRepository() {
    return new HttpSessionCsrfTokenRepository();
  }

  /**
   * When the cross-site cookie env is set (Secure + SameSite=None), also mark
   * the session cookie Partitioned so Safari will store it.
   */
  @Bean
  ServletContextInitializer partitionedSessionCookie(
      @Value("${server.servlet.session.cookie.secure:false}") boolean secure,
      @Value("${server.servlet.session.cookie.same-site:lax}") String sameSite) {
    return SessionCookiePartition.initializer(secure, sameSite);
  }

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      CsrfTokenRepository csrfTokenRepository,
      AdminSessionTokens sessionTokens,
      AdminCredentials credentials) throws Exception {
    CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
    // Prefer header token from the SPA (returned at login); do not require the
    // XOR-masked deferred token protocol used by some Spring+browser setups.
    csrfHandler.setCsrfRequestAttributeName(null);
    AdminBearerAuthenticationFilter bearerFilter =
        new AdminBearerAuthenticationFilter(sessionTokens, credentials);

    http
        .addFilterBefore(bearerFilter, CsrfFilter.class)
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf
            .csrfTokenRepository(csrfTokenRepository)
            .csrfTokenRequestHandler(csrfHandler)
            .ignoringRequestMatchers("/api/admin/login", "/api/admin/logout")
            // A bearer is not sent automatically, so CSRF does not apply. This is
            // what lets phone admin writes succeed after Safari drops the cookie.
            .ignoringRequestMatchers(request ->
                Boolean.TRUE.equals(request.getAttribute(AdminBearerAuthenticationFilter.AUTHENTICATED))))
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/error", "/favicon.ico", "/favicon.svg").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/health", "/api/about", "/api/skills",
                "/api/experience", "/api/projects", "/api/projects/**", "/api/content-revision")
                .permitAll()
            .requestMatchers(HttpMethod.GET, "/cv/**", "/media/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().denyAll())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((request, response, authException) ->
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, AdminAuthController.AUTH_FAILED_JSON))
            .accessDeniedHandler((request, response, accessDeniedException) ->
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, AdminAuthController.AUTH_FAILED_JSON)))
        .httpBasic(basic -> basic.disable())
        .formLogin(form -> form.disable())
        .logout(logout -> logout.disable());
    return http.build();
  }

  private static void writeJson(HttpServletResponse response, int status, String body)
      throws IOException {
    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(body);
  }
}
