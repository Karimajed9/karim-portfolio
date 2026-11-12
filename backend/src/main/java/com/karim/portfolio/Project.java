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

  public void setName(String name) { this.name = name; }
  public void setSummary(String summary) { this.summary = summary; }
  public void setTags(String tags) { this.tags = tags; }
  public void setHref(String href) { this.href = href; }
}
