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
  private String categoryEn;
  private String categoryFr;
  private String nameEn;
  private String nameFr;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getCategoryEn() { return categoryEn; }
  public String getCategoryFr() { return categoryFr; }
  public String getNameEn() { return nameEn; }
  public String getNameFr() { return nameFr; }
  public Integer getSortOrder() { return sortOrder; }

  public void setCategoryEn(String categoryEn) { this.categoryEn = categoryEn; }
  public void setCategoryFr(String categoryFr) { this.categoryFr = categoryFr; }
  public void setNameEn(String nameEn) { this.nameEn = nameEn; }
  public void setNameFr(String nameFr) { this.nameFr = nameFr; }
  public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
