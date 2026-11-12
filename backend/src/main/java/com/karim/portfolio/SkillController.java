package com.karim.portfolio;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SkillController {
  private final SkillRepository skills;

  public SkillController(SkillRepository skills) {
    this.skills = skills;
  }

  @GetMapping("/api/skills")
  public List<Skill> list() {
    return skills.findAllByOrderByCategoryEnAscSortOrderAsc();
  }
}
