package com.karim.portfolio;

import jakarta.validation.Valid;
import java.util.Locale;
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
public class AdminProjectController {
  private final ProjectRepository projects;
  private final ContentRevision contentRevision;

  public AdminProjectController(ProjectRepository projects, ContentRevision contentRevision) {
    this.projects = projects;
    this.contentRevision = contentRevision;
  }

  @PostMapping("/api/admin/projects")
  @ResponseStatus(HttpStatus.CREATED)
  public Project create(@Valid @RequestBody ProjectRequest body) {
    String slug = normalizeSlug(body.slug());
    if (projects.existsBySlug(slug)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already in use");
    }
    Project row = new Project();
    apply(row, body, slug);
    Project saved = projects.save(row);
    contentRevision.bump();
    return saved;
  }

  @PutMapping("/api/admin/projects/{id}")
  public Project update(@PathVariable long id, @Valid @RequestBody ProjectRequest body) {
    Project row = projects.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    String slug = normalizeSlug(body.slug());
    if (projects.existsBySlugAndIdNot(slug, id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already in use");
    }
    apply(row, body, slug);
    Project saved = projects.save(row);
    contentRevision.bump();
    return saved;
  }

  @DeleteMapping("/api/admin/projects/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    if (!projects.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
    }
    projects.deleteById(id);
    contentRevision.bump();
  }

  private static void apply(Project row, ProjectRequest body, String slug) {
    row.setSlug(slug);
    row.setNameEn(body.nameEn().trim());
    row.setNameFr(trimToEmpty(body.nameFr()));
    row.setSummaryEn(body.summaryEn().trim());
    row.setSummaryFr(trimToEmpty(body.summaryFr()));
    row.setTagsEn(trimToEmpty(body.tagsEn()));
    row.setTagsFr(trimToEmpty(body.tagsFr()));
    row.setHref(trimToEmpty(body.href()));
    row.setCategoryEn(trimToEmpty(body.categoryEn()));
    row.setCategoryFr(trimToEmpty(body.categoryFr()));
    row.setStatusEn(trimToEmpty(body.statusEn()));
    row.setStatusFr(trimToEmpty(body.statusFr()));
    row.setCoverImageUrl(trimToEmpty(body.coverImageUrl()));
    row.setLiveDemoUrl(trimToEmpty(body.liveDemoUrl()));
    row.setRoleEn(trimToEmpty(body.roleEn()));
    row.setRoleFr(trimToEmpty(body.roleFr()));
    row.setOverviewEn(trimToEmpty(body.overviewEn()));
    row.setOverviewFr(trimToEmpty(body.overviewFr()));
    row.setProblemEn(trimToEmpty(body.problemEn()));
    row.setProblemFr(trimToEmpty(body.problemFr()));
    row.setArchitectureImageUrl(trimToEmpty(body.architectureImageUrl()));
    row.setArchitectureCaptionEn(trimToEmpty(body.architectureCaptionEn()));
    row.setArchitectureCaptionFr(trimToEmpty(body.architectureCaptionFr()));
    row.setFeaturesEn(trimToEmpty(body.featuresEn()));
    row.setFeaturesFr(trimToEmpty(body.featuresFr()));
    row.setTradeoffsEn(trimToEmpty(body.tradeoffsEn()));
    row.setTradeoffsFr(trimToEmpty(body.tradeoffsFr()));
    row.setChallengesEn(trimToEmpty(body.challengesEn()));
    row.setChallengesFr(trimToEmpty(body.challengesFr()));
    row.setTestingEn(trimToEmpty(body.testingEn()));
    row.setTestingFr(trimToEmpty(body.testingFr()));
    row.setGalleryUrls(trimToEmpty(body.galleryUrls()));
    row.setLessonsEn(trimToEmpty(body.lessonsEn()));
    row.setLessonsFr(trimToEmpty(body.lessonsFr()));
    row.setMark(trimToEmpty(body.mark()));
    row.setSortOrder(body.sortOrder());
  }

  static String normalizeSlug(String raw) {
    String slug = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-+|-+$", "");
    if (slug.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug is required");
    }
    return slug;
  }

  private static String trimToEmpty(String value) {
    return value == null ? "" : value.trim();
  }
}
