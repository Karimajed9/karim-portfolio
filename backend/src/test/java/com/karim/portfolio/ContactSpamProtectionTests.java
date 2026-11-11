package com.karim.portfolio;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * Docker-free slice: controller + honeypot + in-memory rate-limit filter.
 */
class ContactSpamProtectionTests {

  MockMvc mockMvc;
  ContactRateLimiter rateLimiter;
  ContactMessageRepository messages;

  @BeforeEach
  void setUp() {
    messages = mock(ContactMessageRepository.class);
    when(messages.save(any(ContactMessage.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    rateLimiter = new ContactRateLimiter(1, 60_000);
    mockMvc =
        MockMvcBuilders.standaloneSetup(new ContactController(messages))
            .addFilters(new ContactRateLimitFilter(rateLimiter))
            .build();
  }

  @Test
  void acceptsValidContact() throws Exception {
    mockMvc
        .perform(
            post("/api/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Karim","email":"karim@example.com","message":"Hello from a real form"}
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("ok"));

    verify(messages).save(any(ContactMessage.class));
  }

  @Test
  void rejectsFilledHoneypot() throws Exception {
    mockMvc
        .perform(
            post("/api/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Bot","email":"bot@example.com","message":"spam payload here","website":"https://spam.example"}
                    """))
        .andExpect(status().isBadRequest());

    verify(messages, never()).save(any(ContactMessage.class));
  }

  @Test
  void rateLimitsSecondRequestFromSameIpWithinMinute() throws Exception {
    String body =
        """
        {"name":"Karim","email":"karim@example.com","message":"Hello from a real form"}
        """;

    mockMvc
        .perform(
            post("/api/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Forwarded-For", "203.0.113.50")
                .content(body))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/api/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Forwarded-For", "203.0.113.50")
                .content(body))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().string("Retry-After", "60"))
        .andExpect(jsonPath("$.error").exists());
  }
}
