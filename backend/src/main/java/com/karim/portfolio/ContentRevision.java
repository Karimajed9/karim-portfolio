package com.karim.portfolio;

import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

/**
 * Monotonic revision bumped when admin content (experience, projects, skills,
 * education, CV) changes. Public clients poll {@code /api/content-revision}.
 */
@Component
public class ContentRevision {

  private final AtomicLong revision = new AtomicLong(1L);

  public long current() {
    return revision.get();
  }

  public long bump() {
    return revision.incrementAndGet();
  }
}
