package com.karim.portfolio;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ContactController {
  private final ContactMessageRepository messages;

  public ContactController(ContactMessageRepository messages) {
    this.messages = messages;
  }

  @PostMapping("/api/contact")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> create(@Valid @RequestBody ContactRequest body) {
    if (body.website() != null && !body.website().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejected");
    }
    messages.save(new ContactMessage(body.name(), body.email(), body.message()));
    return Map.of("status", "ok");
  }
}
