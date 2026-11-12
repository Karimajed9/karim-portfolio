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
  private String company;
  private String role;
  private String startDate;
  private String endDate;
  private String location;
  private String highlights;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getCompany() { return company; }
  public String getRole() { return role; }
  public String getStartDate() { return startDate; }
  public String getEndDate() { return endDate; }
  public String getLocation() { return location; }
  public String getHighlights() { return highlights; }
  public Integer getSortOrder() { return sortOrder; }

  public void setCompany(String company) { this.company = company; }
  public void setRole(String role) { this.role = role; }
  public void setStartDate(String startDate) { this.startDate = startDate; }
  public void setEndDate(String endDate) { this.endDate = endDate; }
  public void setLocation(String location) { this.location = location; }
  public void setHighlights(String highlights) { this.highlights = highlights; }
  public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
