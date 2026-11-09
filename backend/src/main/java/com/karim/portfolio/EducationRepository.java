package com.karim.portfolio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationRepository extends JpaRepository<Education, Long> {
  List<Education> findAllByOrderBySortOrderAsc();
}
