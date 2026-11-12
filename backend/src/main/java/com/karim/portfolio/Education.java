package com.karim.portfolio;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "education")
public class Education {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String school;
  private String city;
  private String degree;
  private String country;
  private String startDate;
  private String endDate;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getSchool() { return school; }
  public String getCity() { return city; }
  public String getDegree() { return degree; }
  public String getCountry() { return country; }
  public String getStartDate() { return startDate; }
  public String getEndDate() { return endDate; }
  public Integer getSortOrder() { return sortOrder; }

  public void setSchool(String school) { this.school = school; }
  public void setCity(String city) { this.city = city; }
  public void setDegree(String degree) { this.degree = degree; }
  public void setCountry(String country) { this.country = country; }
  public void setStartDate(String startDate) { this.startDate = startDate; }
  public void setEndDate(String endDate) { this.endDate = endDate; }
  public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
