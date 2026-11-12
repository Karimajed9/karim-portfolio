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
  private String nameEn;
  private String nameFr;
  private String summaryEn;
  private String summaryFr;
  private String tagsEn;
  private String tagsFr;
  private String href;

  public Long getId() { return id; }
  public String getNameEn() { return nameEn; }
  public String getNameFr() { return nameFr; }
  public String getSummaryEn() { return summaryEn; }
  public String getSummaryFr() { return summaryFr; }
  public String getTagsEn() { return tagsEn; }
  public String getTagsFr() { return tagsFr; }
  public String getHref() { return href; }

  public void setNameEn(String nameEn) { this.nameEn = nameEn; }
  public void setNameFr(String nameFr) { this.nameFr = nameFr; }
  public void setSummaryEn(String summaryEn) { this.summaryEn = summaryEn; }
  public void setSummaryFr(String summaryFr) { this.summaryFr = summaryFr; }
  public void setTagsEn(String tagsEn) { this.tagsEn = tagsEn; }
  public void setTagsFr(String tagsFr) { this.tagsFr = tagsFr; }
  public void setHref(String href) { this.href = href; }
}
