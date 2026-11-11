package com.karim.portfolio;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Contact form payload. {@code website} is a honeypot — humans leave it empty;
 * bots that fill it are rejected.
 */
public record ContactRequest(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank String message,
    String website) {}
