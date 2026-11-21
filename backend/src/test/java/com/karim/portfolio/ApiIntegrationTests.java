package com.karim.portfolio;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.karim.portfolio.storage.BlobStorageProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Thin slice of end-to-end API checks against a real Postgres (Testcontainers).
 * Covers public routes and session-based admin auth.
 */
@SpringBootTest(properties = "SESSION_COOKIE_SECURE=true")
@AutoConfigureMockMvc
@Import(PostgresTestcontainersConfig.class)
class ApiIntegrationTests {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	Environment environment;

	@Autowired
	ContactMessageRepository contactMessages;

	@Autowired
	JdbcTemplate jdbc;

	@Autowired
	BlobStorageProperties storageProperties;

	@Test
	void sessionCookieIsSecureHttpOnlyAndLax() {
		assertEquals("true", environment.getProperty("SESSION_COOKIE_SECURE"));
		assertEquals("true", environment.getProperty("server.servlet.session.cookie.secure"));
		assertEquals("true", environment.getProperty("server.servlet.session.cookie.http-only"));
		String sameSite = environment.getProperty("server.servlet.session.cookie.same-site");
		assertEquals("lax", sameSite);
		assertNotEquals("none", sameSite);
	}

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
	void contentRevisionIsPublic() throws Exception {
		mockMvc.perform(get("/api/content-revision"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.revision").isNumber());
	}

	@Test
	void cvPdfIsPublic() throws Exception {
		mockMvc.perform(get("/cv/" + CvFiles.EN_FILENAME))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
	}

	@Test
	void adminMessagesRequiresAuth() throws Exception {
		mockMvc.perform(get("/api/admin/messages"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void adminLoginRejectsBadPasswordWithGenericBody() throws Exception {
		mockMvc.perform(post("/api/admin/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"admin","password":"wrong-password"}
								"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.error").value("Authentication failed"));
	}

	@Test
	void adminSessionCanReadMessagesAndCreateProject() throws Exception {
		SessionAuth auth = loginAsAdmin();

		mockMvc.perform(get("/api/admin/messages").session(auth.session()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content").isArray())
				.andExpect(jsonPath("$.size").value(20));

		long before = readRevision();

		mockMvc.perform(post("/api/admin/projects")
						.session(auth.session())
						.header("X-CSRF-TOKEN", auth.csrfToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"slug":"admin-project","nameEn":"Admin Project","nameFr":"Projet admin","summaryEn":"Created in test","summaryFr":"Créé en test","tagsEn":"Java","tagsFr":"Java","href":"https://example.com/admin","categoryEn":"Test","statusEn":"Planned","sortOrder":99}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.nameEn").value("Admin Project"))
				.andExpect(jsonPath("$.nameFr").value("Projet admin"))
				.andExpect(jsonPath("$.slug").value("admin-project"));

		mockMvc.perform(get("/api/projects/personal-portfolio-platform"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.slug").value("personal-portfolio-platform"))
				.andExpect(jsonPath("$.nameEn").value("Personal Portfolio Platform"));

		mockMvc.perform(get("/api/projects/missing-slug"))
				.andExpect(status().isNotFound());

		long after = readRevision();
		org.junit.jupiter.api.Assertions.assertTrue(after > before);
	}

	@Test
	void adminCanDeleteContactMessage() throws Exception {
		SessionAuth auth = loginAsAdmin();
		ContactMessage saved = contactMessages.save(
				new ContactMessage("Delete Me", "delete@example.com", "Please remove this message"));

		mockMvc.perform(get("/api/admin/messages")
						.session(auth.session())
						.param("page", "0")
						.param("size", "20"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(saved.getId()))
				.andExpect(jsonPath("$.content[0].email").value("delete@example.com"));

		mockMvc.perform(delete("/api/admin/messages/" + saved.getId())
						.session(auth.session())
						.header("X-CSRF-TOKEN", auth.csrfToken()))
				.andExpect(status().isNoContent());

		org.junit.jupiter.api.Assertions.assertFalse(contactMessages.existsById(saved.getId()));
	}

	@Test
	void adminCanReplaceCvPdf() throws Exception {
		SessionAuth auth = loginAsAdmin();
		byte[] pdf = "%PDF-1.4 test-cv".getBytes();
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"resume.pdf",
				"application/pdf",
				pdf);

		mockMvc.perform(multipart("/api/admin/uploads")
						.file(file)
						.param("slot", "cv-en")
						.session(auth.session())
						.header("X-CSRF-TOKEN", auth.csrfToken()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.url").value("/cv/" + CvFiles.EN_FILENAME));

		mockMvc.perform(get("/cv/" + CvFiles.EN_FILENAME))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF));
	}

	@Test
	void adminCanUploadProjectCoverImage() throws Exception {
		SessionAuth auth = loginAsAdmin();
		byte[] png = new byte[] {
				(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
				0, 0, 0, 0, 0, 0, 0, 0
		};
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"cover.png",
				"image/png",
				png);

		MvcResult upload = mockMvc.perform(multipart("/api/admin/uploads")
						.file(file)
						.session(auth.session())
						.header("X-CSRF-TOKEN", auth.csrfToken()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.url").isString())
				.andReturn();

		String url = JsonPath.read(upload.getResponse().getContentAsString(), "$.url");
		org.junit.jupiter.api.Assertions.assertTrue(
				url.startsWith("/media/uploads/"),
				() -> "expected /media/uploads/ URL, got " + url);
		String key = url.substring("/media/".length());

		byte[] stored = jdbc.queryForObject(
				"SELECT payload FROM stored_blob WHERE storage_key = ?",
				byte[].class,
				key);
		assertArrayEquals(png, stored);

		Path localFile = Path.of(storageProperties.getLocalDir()).toAbsolutePath().normalize().resolve(key);
		assertFalse(Files.exists(localFile), () -> "cover must not be on disk: " + localFile);

		mockMvc.perform(get(url))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.IMAGE_PNG))
				.andExpect(content().bytes(png));
	}

	@Test
	void adminProjectWriteRequiresAuth() throws Exception {
		mockMvc.perform(post("/api/admin/projects")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"slug":"x","nameEn":"X","summaryEn":"Y","tagsEn":"a","href":"https://example.com","sortOrder":0}
								"""))
				.andExpect(status().isUnauthorized());
	}

	private SessionAuth loginAsAdmin() throws Exception {
		MvcResult login = mockMvc.perform(post("/api/admin/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"admin","password":"test-admin-password"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.csrfToken").isString())
				.andReturn();
		MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
		String csrf = JsonPath.read(login.getResponse().getContentAsString(), "$.csrfToken");
		return new SessionAuth(session, csrf);
	}

	private long readRevision() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/content-revision"))
				.andExpect(status().isOk())
				.andReturn();
		Number revision = JsonPath.read(result.getResponse().getContentAsString(), "$.revision");
		return revision.longValue();
	}

	private record SessionAuth(MockHttpSession session, String csrfToken) {}
}
