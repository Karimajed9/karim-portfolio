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
public class AdminExperienceController {
  private final ExperienceRepository experience;

  public AdminExperienceController(ExperienceRepository experience) {
    this.experience = experience;
  }

  @PostMapping("/api/admin/experience")
  @ResponseStatus(HttpStatus.CREATED)
  public Experience create(@Valid @RequestBody ExperienceRequest body) {
    Experience row = new Experience();
    apply(row, body);
    return experience.save(row);
  }

  @PutMapping("/api/admin/experience/{id}")
  public Experience update(@PathVariable long id, @Valid @RequestBody ExperienceRequest body) {
    Experience row = experience.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found"));
    apply(row, body);
    return experience.save(row);
  }

  @DeleteMapping("/api/admin/experience/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!experience.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found");
    }
    experience.deleteById(id);
  }

  private static void apply(Experience row, ExperienceRequest body) {
    row.setCompany(body.company().trim());
    row.setRole(body.role().trim());
    row.setStartDate(body.startDate().trim());
    row.setEndDate(body.endDate().trim());
    row.setLocation(body.location().trim());
    row.setHighlights(body.highlights() == null ? "" : body.highlights().trim());
    row.setSortOrder(body.sortOrder());
  }
}
