package com.karim.portfolio;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminAuthController {

  static final String AUTH_FAILED_JSON = "{\"error\":\"Authentication failed\"}";

  private final AdminCredentials credentials;
  private final PasswordEncoder passwordEncoder;
  private final AdminLoginProtector loginProtector;
  private final CsrfTokenRepository csrfTokenRepository;
  private final AdminSessionTokens sessionTokens;
  private final SecurityContextRepository securityContextRepository =
      new HttpSessionSecurityContextRepository();

  public AdminAuthController(
      AdminCredentials credentials,
      PasswordEncoder passwordEncoder,
      AdminLoginProtector loginProtector,
      CsrfTokenRepository csrfTokenRepository,
      AdminSessionTokens sessionTokens) {
    this.credentials = credentials;
    this.passwordEncoder = passwordEncoder;
    this.loginProtector = loginProtector;
    this.csrfTokenRepository = csrfTokenRepository;
    this.sessionTokens = sessionTokens;
  }

  @PostMapping("/api/admin/login")
  public ResponseEntity<Map<String, String>> login(
      @Valid @RequestBody AdminLoginRequest body,
      HttpServletRequest request,
      HttpServletResponse response) {
    String clientKey = ContactRateLimitFilter.clientKey(request);

    if (loginProtector.isLocked(clientKey)) {
      return authFailed();
    }

    String providedUser = body.username() == null ? "" : body.username().trim();
    String providedPass = body.password() == null ? "" : body.password();

    boolean userOk = constantTimeEquals(credentials.username(), providedUser);
    // Always run bcrypt verify so username misses do not skip the expensive compare.
    boolean passOk = passwordMatches(passwordEncoder, credentials.passwordHash(), providedPass);

    if (!userOk || !passOk) {
      loginProtector.recordFailure(clientKey);
      return authFailed();
    }

    loginProtector.recordSuccess(clientKey);

    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
            credentials.username(),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    SecurityContextHolder.setContext(context);
    securityContextRepository.saveContext(context, request, response);

    CsrfToken csrf = csrfTokenRepository.generateToken(request);
    csrfTokenRepository.saveToken(csrf, request, response);

    return ResponseEntity.ok(Map.of(
        "status", "ok",
        "csrfToken", csrf.getToken(),
        "sessionToken", sessionTokens.issue()));
  }

  @PostMapping("/api/admin/logout")
  public ResponseEntity<Map<String, String>> logout(
      HttpServletRequest request, HttpServletResponse response) {
    SecurityContextHolder.clearContext();
    sessionTokens.revoke(AdminBearerAuthenticationFilter.bearerToken(request));
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.invalidate();
    }
    csrfTokenRepository.saveToken(null, request, response);
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  private static ResponseEntity<Map<String, String>> authFailed() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", "Authentication failed"));
  }

  /**
   * Constant-time equality for arbitrary-length strings via SHA-256 digests
   * (fixed-length {@link MessageDigest#isEqual}).
   */
  /**
   * Exact match first. If that fails and the only difference is surrounding
   * whitespace (password managers on phones), try the trimmed password.
   * A password that intentionally starts or ends with a space still matches
   * the first check.
   */
  static boolean passwordMatches(PasswordEncoder encoder, String hash, String provided) {
    if (encoder.matches(provided, hash)) {
      return true;
    }
    String trimmed = provided.trim();
    return !trimmed.equals(provided) && encoder.matches(trimmed, hash);
  }

  static boolean constantTimeEquals(String expected, String provided) {
    byte[] digA = sha256(expected.getBytes(StandardCharsets.UTF_8));
    byte[] digB = sha256(provided.getBytes(StandardCharsets.UTF_8));
    return MessageDigest.isEqual(digA, digB);
  }

  private static byte[] sha256(byte[] input) {
    try {
      return MessageDigest.getInstance("SHA-256").digest(input);
    } catch (java.security.NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 unavailable", e);
    }
  }
}
