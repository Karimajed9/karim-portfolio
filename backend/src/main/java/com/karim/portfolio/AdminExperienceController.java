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
  private final ContentRevision contentRevision;

  public AdminExperienceController(ExperienceRepository experience, ContentRevision contentRevision) {
    this.experience = experience;
    this.contentRevision = contentRevision;
  }

  @PostMapping("/api/admin/experience")
  @ResponseStatus(HttpStatus.CREATED)
  public Experience create(@Valid @RequestBody ExperienceRequest body) {
    Experience row = new Experience();
    apply(row, body);
    Experience saved = experience.save(row);
    contentRevision.bump();
    return saved;
  }

  @PutMapping("/api/admin/experience/{id}")
  public Experience update(@PathVariable long id, @Valid @RequestBody ExperienceRequest body) {
    Experience row = experience.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found"));
    apply(row, body);
    Experience saved = experience.save(row);
    contentRevision.bump();
    return saved;
  }

  @DeleteMapping("/api/admin/experience/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!experience.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found");
    }
    experience.deleteById(id);
    contentRevision.bump();
  }

  private static void apply(Experience row, ExperienceRequest body) {
    row.setCompanyEn(body.companyEn().trim());
    row.setCompanyFr(trimToEmpty(body.companyFr()));
    row.setRoleEn(body.roleEn().trim());
    row.setRoleFr(trimToEmpty(body.roleFr()));
    row.setStartDate(body.startDate().trim());
    row.setEndDate(body.endDate().trim());
    row.setLocationEn(body.locationEn().trim());
    row.setLocationFr(trimToEmpty(body.locationFr()));
    row.setHighlightsEn(trimToEmpty(body.highlightsEn()));
    row.setHighlightsFr(trimToEmpty(body.highlightsFr()));
    row.setSortOrder(body.sortOrder());
  }

  private static String trimToEmpty(String value) {
    return value == null ? "" : value.trim();
  }
}
