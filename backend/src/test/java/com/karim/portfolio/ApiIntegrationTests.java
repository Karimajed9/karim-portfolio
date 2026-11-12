package com.karim.portfolio;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Thin slice of end-to-end API checks against a real Postgres (Testcontainers).
 * Learning focus: public vs secured routes, and Basic auth with MockMvc.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(PostgresTestcontainersConfig.class)
class ApiIntegrationTests {

	@Autowired
	MockMvc mockMvc;

	@Test
	void healthReturnsOk() throws Exception {
		mockMvc.perform(get("/api/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("ok"));
	}

	@Test
	void projectsIsPublic() throws Exception {
		mockMvc.perform(get("/api/projects"))
				.andExpect(status().isOk());
	}

	@Test
	void adminMessagesRequiresAuth() throws Exception {
		mockMvc.perform(get("/api/admin/messages"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void adminMessagesWithBasicAuth() throws Exception {
		// Default ADMIN_PASSWORD is "password" when the env var is unset (see SecurityConfig).
		mockMvc.perform(get("/api/admin/messages").with(httpBasic("admin", "password")))
				.andExpect(status().isOk());
	}

	@Test
	void adminProjectWriteRequiresAuth() throws Exception {
		mockMvc.perform(post("/api/admin/projects")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"X","summary":"Y","tags":"a","href":"https://example.com"}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void adminCanCreateProjectWithBasicAuth() throws Exception {
		mockMvc.perform(post("/api/admin/projects")
						.with(httpBasic("admin", "password"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Admin Project","summary":"Created in test","tags":"Java","href":"https://example.com/admin"}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Admin Project"));
	}
}
