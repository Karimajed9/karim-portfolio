package com.karim.portfolio;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "project")
public class Project {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String summary;
  private String tags;
  private String href;

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getSummary() { return summary; }
  public String getTags() { return tags; }
  public String getHref() { return href; }
}