package com.karim.portfolio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AdminContactController {
  static final int DEFAULT_PAGE_SIZE = 20;

  private final ContactMessageRepository messages;

  public AdminContactController(ContactMessageRepository messages) {
    this.messages = messages;
  }

  /** Newest first, {@value #DEFAULT_PAGE_SIZE} per page by default. */
  @GetMapping("/api/admin/messages")
  public Page<ContactMessage> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "" + DEFAULT_PAGE_SIZE) int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    return messages.findAll(
        PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
  }

  @DeleteMapping("/api/admin/messages/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!messages.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found");
    }
    messages.deleteById(id);
  }
}
