package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.servlet.FilterChain;
import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

class AdminPhoneLoginTest {

	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	@AfterEach
	void clearSecurityContext() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void passwordMatchAllowsSurroundingWhitespaceOnlyAsFallback() {
		String hash = encoder.encode("correct-password");
		assertTrue(AdminAuthController.passwordMatches(encoder, hash, "correct-password"));
		assertTrue(AdminAuthController.passwordMatches(encoder, hash, " correct-password "));
		assertTrue(AdminAuthController.passwordMatches(encoder, hash, "correct-password\n"));
		assertFalse(AdminAuthController.passwordMatches(encoder, hash, "wrong-password"));
	}

	@Test
	void usernameCompareStaysCaseSensitiveAfterTrim() {
		assertTrue(AdminAuthController.constantTimeEquals("admin", "admin"));
		assertFalse(AdminAuthController.constantTimeEquals("admin", "Admin"));
	}

	@Test
	void partitionedCookieOnlyForSecureCrossSite() throws Exception {
		assertTrue(SessionCookiePartition.shouldPartition(true, "None"));
		assertFalse(SessionCookiePartition.shouldPartition(false, "none"));
		assertFalse(SessionCookiePartition.shouldPartition(true, "lax"));

		MockServletContext secure = new MockServletContext();
		SessionCookiePartition.initializer(true, "none").onStartup(secure);
		assertEquals("", secure.getSessionCookieConfig().getAttribute(SessionCookiePartition.ATTRIBUTE));

		MockServletContext local = new MockServletContext();
		SessionCookiePartition.initializer(false, "lax").onStartup(local);
		assertNull(local.getSessionCookieConfig().getAttribute(SessionCookiePartition.ATTRIBUTE));
	}

	@Test
	void bearerAuthenticatesWithoutASessionCookie() throws Exception {
		AdminSessionTokens tokens = new AdminSessionTokens(Duration.ofMinutes(30));
		AdminCredentials credentials = new AdminCredentials("admin", "test-admin-password", encoder);
		AdminBearerAuthenticationFilter filter = new AdminBearerAuthenticationFilter(tokens, credentials);
		String token = tokens.issue();

		MockHttpServletRequest request = new MockHttpServletRequest();
		request.addHeader("Authorization", "Bearer " + token);
		FilterChain chain = (req, res) -> assertEquals(
				Boolean.TRUE,
				req.getAttribute(AdminBearerAuthenticationFilter.AUTHENTICATED));

		filter.doFilter(request, new MockHttpServletResponse(), chain);

		assertTrue(SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
		assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
				.anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())));
	}

	@Test
	void loginRotatesAPlantedSessionAndDoesNotCacheTheBearer() {
		AdminAuthController controller = loginController();
		MockHttpServletRequest request = new MockHttpServletRequest();
		String planted = request.getSession(true).getId();
		MockHttpServletResponse response = new MockHttpServletResponse();

		ResponseEntity<Map<String, String>> result = controller.login(
				new AdminLoginRequest("admin", "test-admin-password"), request, response);

		assertEquals(200, result.getStatusCode().value());
		assertEquals("no-store", result.getHeaders().getCacheControl());
		assertFalse(result.getBody().get("sessionToken").isBlank());
		assertFalse(planted.equals(request.getSession(false).getId()));

		MockHttpServletRequest fresh = new MockHttpServletRequest();
		ResponseEntity<Map<String, String>> withoutCookie = controller.login(
				new AdminLoginRequest("admin", "test-admin-password"), fresh, new MockHttpServletResponse());
		assertEquals(200, withoutCookie.getStatusCode().value());
		assertFalse(withoutCookie.getBody().get("sessionToken").isBlank());
		assertEquals("no-store", withoutCookie.getHeaders().getCacheControl());
	}

	@Test
	void failedLoginIsNotCachedAndKeepsThePhonePasswordTrim() {
		AdminAuthController controller = loginController();
		MockHttpServletRequest request = new MockHttpServletRequest();
		ResponseEntity<Map<String, String>> result = controller.login(
				new AdminLoginRequest("admin", " wrong-password "), request, new MockHttpServletResponse());

		assertEquals(401, result.getStatusCode().value());
		assertEquals("no-store", result.getHeaders().getCacheControl());
		assertNull(result.getBody().get("sessionToken"));
	}

	@Test
	void clientKeyUsesTheProxyAppendedAddress() {
		MockHttpServletRequest single = new MockHttpServletRequest();
		single.addHeader("X-Forwarded-For", "203.0.113.50");
		assertEquals("203.0.113.50", ContactRateLimitFilter.clientKey(single));

		MockHttpServletRequest spoofed = new MockHttpServletRequest();
		spoofed.addHeader("X-Forwarded-For", "198.51.100.9, 203.0.113.50");
		assertEquals("203.0.113.50", ContactRateLimitFilter.clientKey(spoofed));
	}

	private AdminAuthController loginController() {
		return new AdminAuthController(
				new AdminCredentials("admin", "test-admin-password", encoder),
				encoder,
				new AdminLoginProtector(5, 60_000),
				new HttpSessionCsrfTokenRepository(),
				new AdminSessionTokens(Duration.ofMinutes(30)));
	}

	@Test
	void revokedBearerIsRejected() {
		AdminSessionTokens tokens = new AdminSessionTokens(Duration.ofMinutes(30));
		String token = tokens.issue();
		assertTrue(tokens.isValid(token));
		tokens.revoke(token);
		assertFalse(tokens.isValid(token));
		assertFalse(tokens.isValid("nope"));
	}
}
