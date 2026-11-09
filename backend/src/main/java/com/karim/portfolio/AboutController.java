package com.karim.portfolio;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
public class AboutController {
  private final AboutProfileRepository aboutProfiles;
  private final EducationRepository education;

  public AboutController(AboutProfileRepository aboutProfiles, EducationRepository education) {
    this.aboutProfiles = aboutProfiles;
    this.education = education;
  }

  @GetMapping("/api/about")
  public AboutResponse get() {
    AboutProfile profile = aboutProfiles.findAll().stream()
        .findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "About profile not found"));
    return new AboutResponse(
        profile.getSummary(),
        profile.getGoals(),
        profile.getProfessionalInterests(),
        profile.getPersonalInterests(),
        education.findAllByOrderBySortOrderAsc()
    );
  }
}
