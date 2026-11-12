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
    Project row = new Project();
    apply(row, body);
    Project saved = projects.save(row);
    contentRevision.bump();
    return saved;
  }

  @PutMapping("/api/admin/projects/{id}")
  public Project update(@PathVariable long id, @Valid @RequestBody ProjectRequest body) {
    Project row = projects.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    apply(row, body);
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

  private static void apply(Project row, ProjectRequest body) {
    row.setName(body.name().trim());
    row.setSummary(body.summary().trim());
    row.setTags(body.tags() == null ? "" : body.tags().trim());
    row.setHref(body.href() == null ? "" : body.href().trim());
  }
}
