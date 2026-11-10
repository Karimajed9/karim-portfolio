package com.karim.portfolio;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/error").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/health", "/api/about", "/api/skills",
                "/api/experience", "/api/projects").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().denyAll())
        .httpBasic(Customizer.withDefaults());
    return http.build();
  }

  /**
   * Admin password is BCrypt-encoded once at startup from {@code ADMIN_PASSWORD}
   * (default {@code password}). Changing the env var requires an application restart.
   */
  @Bean
  UserDetailsService users(PasswordEncoder encoder) {
    String raw = System.getenv().getOrDefault("ADMIN_PASSWORD", "password");
    return new InMemoryUserDetailsManager(
        User.withUsername("admin")
            .password(encoder.encode(raw))
            .roles("ADMIN")
            .build());
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
