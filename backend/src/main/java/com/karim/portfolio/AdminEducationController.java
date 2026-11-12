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

  public AdminEducationController(EducationRepository education) {
    this.education = education;
  }

  @PostMapping("/api/admin/education")
  @ResponseStatus(HttpStatus.CREATED)
  public Education create(@Valid @RequestBody EducationRequest body) {
    Education row = new Education();
    apply(row, body);
    return education.save(row);
  }

  @PutMapping("/api/admin/education/{id}")
  public Education update(@PathVariable long id, @Valid @RequestBody EducationRequest body) {
    Education row = education.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Education not found"));
    apply(row, body);
    return education.save(row);
  }

  @DeleteMapping("/api/admin/education/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!education.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Education not found");
    }
    education.deleteById(id);
  }

  private static void apply(Education row, EducationRequest body) {
    row.setSchool(body.school().trim());
    row.setCity(body.city().trim());
    row.setDegree(body.degree().trim());
    row.setCountry(body.country().trim());
    row.setStartDate(body.startDate().trim());
    row.setEndDate(body.endDate().trim());
    row.setSortOrder(body.sortOrder());
  }
}
