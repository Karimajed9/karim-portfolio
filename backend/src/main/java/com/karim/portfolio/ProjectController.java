package com.karim.portfolio;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ProjectController {
  private final ProjectRepository projects;

  public ProjectController(ProjectRepository projects) {
    this.projects = projects;
  }

  @GetMapping("/api/projects")
  public List<Project> list() {
    return projects.findAllByOrderBySortOrderAscIdAsc();
  }

  @GetMapping("/api/projects/{slug}")
  public Project bySlug(@PathVariable String slug) {
    return projects.findBySlug(slug)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
  }
}
