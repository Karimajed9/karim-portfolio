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
public class AdminEducationController {
  private final EducationRepository education;
  private final ContentRevision contentRevision;

  public AdminEducationController(EducationRepository education, ContentRevision contentRevision) {
    this.education = education;
    this.contentRevision = contentRevision;
  }

  @PostMapping("/api/admin/education")
  @ResponseStatus(HttpStatus.CREATED)
  public Education create(@Valid @RequestBody EducationRequest body) {
    Education row = new Education();
    apply(row, body);
    Education saved = education.save(row);
    contentRevision.bump();
    return saved;
  }

  @PutMapping("/api/admin/education/{id}")
  public Education update(@PathVariable long id, @Valid @RequestBody EducationRequest body) {
    Education row = education.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Education not found"));
    apply(row, body);
    Education saved = education.save(row);
    contentRevision.bump();
    return saved;
  }

  @DeleteMapping("/api/admin/education/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!education.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Education not found");
    }
    education.deleteById(id);
    contentRevision.bump();
  }

  private static void apply(Education row, EducationRequest body) {
    row.setSchoolEn(body.schoolEn().trim());
    row.setSchoolFr(trimToEmpty(body.schoolFr()));
    row.setCityEn(body.cityEn().trim());
    row.setCityFr(trimToEmpty(body.cityFr()));
    row.setDegreeEn(body.degreeEn().trim());
    row.setDegreeFr(trimToEmpty(body.degreeFr()));
    row.setCountryEn(body.countryEn().trim());
    row.setCountryFr(trimToEmpty(body.countryFr()));
    row.setStartDate(body.startDate().trim());
    row.setEndDate(body.endDate().trim());
    row.setSortOrder(body.sortOrder());
  }

  private static String trimToEmpty(String value) {
    return value == null ? "" : value.trim();
  }
}
