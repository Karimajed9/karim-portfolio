package com.karim.portfolio;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  List<Project> findAllByOrderBySortOrderAscIdAsc();

  Optional<Project> findBySlug(String slug);

  boolean existsBySlugAndIdNot(String slug, Long id);

  boolean existsBySlug(String slug);
}
