package com.karim.portfolio;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Contact is exempt from CSRF so the cross-origin form can post.
 * The security chain still rejects other writes that have no token.
 */
@WebMvcTest(controllers = ContactController.class)
@Import({
    SecurityConfig.class,
    ContactRateLimiter.class,
    ContactRateLimitFilter.class,
    AdminLoginRateLimiter.class,
    AdminSessionTokens.class,
    AdminCredentials.class
})
class ContactSecurityTests {

	private static final String VALID = """
			{"name":"Karim","email":"karim@example.com","message":"Hello from a real form"}
			""";

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ContactRateLimiter rateLimiter;

	@MockitoBean
	ContactMessageRepository messages;

	@BeforeEach
	void resetRateLimit() {
		rateLimiter.reset();
	}

	@Test
	void contactPostSucceedsWithoutCsrfToken() throws Exception {
		when(messages.save(any(ContactMessage.class)))
				.thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(post("/api/contact")
						.contentType(MediaType.APPLICATION_JSON)
						.content(VALID))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("ok"));

		mockMvc.perform(post("/api/contact")
						.contentType(MediaType.APPLICATION_JSON)
						.content(VALID))
				.andExpect(status().isTooManyRequests());
	}

	@Test
	void honeypotStillRejectsWhenSecurityChainIsLoaded() throws Exception {
		mockMvc.perform(post("/api/contact")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Bot","email":"bot@example.com","message":"spam payload here","website":"https://spam.example"}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void otherPostsStillRequireCsrf() throws Exception {
		mockMvc.perform(post("/api/admin/projects")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isUnauthorized());
	}
}
