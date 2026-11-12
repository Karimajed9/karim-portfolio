package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.servlet.FilterChain;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
	void revokedBearerIsRejected() {
		AdminSessionTokens tokens = new AdminSessionTokens(Duration.ofMinutes(30));
		String token = tokens.issue();
		assertTrue(tokens.isValid(token));
		tokens.revoke(token);
		assertFalse(tokens.isValid(token));
		assertFalse(tokens.isValid("nope"));
	}
}
