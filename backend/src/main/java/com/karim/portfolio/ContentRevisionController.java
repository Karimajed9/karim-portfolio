package com.karim.portfolio;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContentRevisionController {

  private final ContentRevision revision;

  public ContentRevisionController(ContentRevision revision) {
    this.revision = revision;
  }

  @GetMapping("/api/content-revision")
  public Map<String, Long> current() {
    return Map.of("revision", revision.current());
  }
}
