package com.karim.portfolio;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class ContactController {
  private final ContactMessageRepository messages;

  public ContactController(ContactMessageRepository messages) {
    this.messages = messages;
  }

  @PostMapping("/api/contact")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> create(@Valid @RequestBody ContactRequest body) {
    messages.save(new ContactMessage(body.name(), body.email(), body.message()));
    return Map.of("status", "ok");
  }
}