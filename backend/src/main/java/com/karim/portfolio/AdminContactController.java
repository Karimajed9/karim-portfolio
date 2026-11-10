package com.karim.portfolio;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminContactController {
  private final ContactMessageRepository messages;

  public AdminContactController(ContactMessageRepository messages) {
    this.messages = messages;
  }

  @GetMapping("/api/admin/messages")
  public List<ContactMessage> list() {
    return messages.findAll();
  }
}
