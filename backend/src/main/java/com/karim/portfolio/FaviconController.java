package com.karim.portfolio;

import java.time.Duration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the KM mark for browser probes. {@code /favicon.ico} returns the same SVG
 * with an SVG content type so probes get 200 without shipping a binary .ico.
 */
@RestController
public class FaviconController {

  private static final Resource FAVICON = new ClassPathResource("static/favicon.svg");
  private static final MediaType SVG = MediaType.valueOf("image/svg+xml");

  @GetMapping({"/favicon.ico", "/favicon.svg"})
  ResponseEntity<Resource> favicon() {
    return ResponseEntity.ok()
        .contentType(SVG)
        .cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
        .body(FAVICON);
  }
}
