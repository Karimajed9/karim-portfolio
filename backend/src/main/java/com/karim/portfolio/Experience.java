package com.karim.portfolio;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "experience")
public class Experience {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String companyEn;
  private String companyFr;
  private String roleEn;
  private String roleFr;
  private String startDate;
  private String endDate;
  private String locationEn;
  private String locationFr;
  private String highlightsEn;
  private String highlightsFr;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getCompanyEn() { return companyEn; }
  public String getCompanyFr() { return companyFr; }
  public String getRoleEn() { return roleEn; }
  public String getRoleFr() { return roleFr; }
  public String getStartDate() { return startDate; }
  public String getEndDate() { return endDate; }
  public String getLocationEn() { return locationEn; }
  public String getLocationFr() { return locationFr; }
  public String getHighlightsEn() { return highlightsEn; }
  public String getHighlightsFr() { return highlightsFr; }
  public Integer getSortOrder() { return sortOrder; }

  public void setCompanyEn(String companyEn) { this.companyEn = companyEn; }
  public void setCompanyFr(String companyFr) { this.companyFr = companyFr; }
  public void setRoleEn(String roleEn) { this.roleEn = roleEn; }
  public void setRoleFr(String roleFr) { this.roleFr = roleFr; }
  public void setStartDate(String startDate) { this.startDate = startDate; }
  public void setEndDate(String endDate) { this.endDate = endDate; }
  public void setLocationEn(String locationEn) { this.locationEn = locationEn; }
  public void setLocationFr(String locationFr) { this.locationFr = locationFr; }
  public void setHighlightsEn(String highlightsEn) { this.highlightsEn = highlightsEn; }
  public void setHighlightsFr(String highlightsFr) { this.highlightsFr = highlightsFr; }
  public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
