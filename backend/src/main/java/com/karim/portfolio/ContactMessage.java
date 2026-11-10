package com.karim.portfolio;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "contact_message")
public class ContactMessage {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String email;
  private String message;
  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  public ContactMessage() {}

  public ContactMessage(String name, String email, String message) {
    this.name = name;
    this.email = email;
    this.message = message;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getEmail() { return email; }
  public String getMessage() { return message; }
  public Instant getCreatedAt() { return createdAt; }
}