package com.karim.portfolio;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AdminSkillController {
  private final SkillRepository skills;

  public AdminSkillController(SkillRepository skills) {
    this.skills = skills;
  }

  @PostMapping("/api/admin/skills")
  @ResponseStatus(HttpStatus.CREATED)
  public Skill create(@Valid @RequestBody SkillRequest body) {
    Skill row = new Skill();
    apply(row, body);
    return skills.save(row);
  }

  @PutMapping("/api/admin/skills/{id}")
  public Skill update(@PathVariable long id, @Valid @RequestBody SkillRequest body) {
    Skill row = skills.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found"));
    apply(row, body);
    return skills.save(row);
  }

  @DeleteMapping("/api/admin/skills/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!skills.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found");
    }
    skills.deleteById(id);
  }

  private static void apply(Skill row, SkillRequest body) {
    row.setCategory(body.category().trim());
    row.setName(body.name().trim());
    row.setSortOrder(body.sortOrder());
  }
}
