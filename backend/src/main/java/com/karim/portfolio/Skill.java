package com.karim.portfolio;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "skill")
public class Skill {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String category;
  private String name;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getCategory() { return category; }
  public String getName() { return name; }
  public Integer getSortOrder() { return sortOrder; }
}
