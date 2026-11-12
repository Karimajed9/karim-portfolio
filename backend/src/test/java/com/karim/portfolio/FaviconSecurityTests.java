package com.karim.portfolio;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Slice test: favicon probes must be public and return the KM mark (200).
 */
@WebMvcTest(controllers = FaviconController.class)
@Import({SecurityConfig.class, ContactRateLimiter.class, AdminLoginRateLimiter.class})
class FaviconSecurityTests {

	@Autowired
	MockMvc mockMvc;

	@Test
	void faviconIcoReturnsKmMark() throws Exception {
		mockMvc.perform(get("/favicon.ico"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("image/svg+xml")))
				.andExpect(content().string(containsString("55B7B1")))
				.andExpect(content().string(containsString("<!-- K -->")))
				.andExpect(content().string(containsString("<!-- M -->")));
	}

	@Test
	void faviconSvgReturnsKmMark() throws Exception {
		mockMvc.perform(get("/favicon.svg"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("image/svg+xml")))
				.andExpect(content().string(containsString("#0B1117")))
				.andExpect(content().string(containsString("<!-- KM")));
	}
}
