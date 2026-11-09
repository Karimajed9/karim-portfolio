package com.karim.portfolio;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExperienceController {
  private final ExperienceRepository experience;

  public ExperienceController(ExperienceRepository experience) {
    this.experience = experience;
  }

  @GetMapping("/api/experience")
  public List<Experience> list() {
    return experience.findAllByOrderBySortOrderAsc();
  }
}
