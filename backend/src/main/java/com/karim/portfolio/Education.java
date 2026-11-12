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
  private String schoolEn;
  private String schoolFr;
  private String cityEn;
  private String cityFr;
  private String degreeEn;
  private String degreeFr;
  private String countryEn;
  private String countryFr;
  private String startDate;
  private String endDate;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getSchoolEn() { return schoolEn; }
  public String getSchoolFr() { return schoolFr; }
  public String getCityEn() { return cityEn; }
  public String getCityFr() { return cityFr; }
  public String getDegreeEn() { return degreeEn; }
  public String getDegreeFr() { return degreeFr; }
  public String getCountryEn() { return countryEn; }
  public String getCountryFr() { return countryFr; }
  public String getStartDate() { return startDate; }
  public String getEndDate() { return endDate; }
  public Integer getSortOrder() { return sortOrder; }

  public void setSchoolEn(String schoolEn) { this.schoolEn = schoolEn; }
  public void setSchoolFr(String schoolFr) { this.schoolFr = schoolFr; }
  public void setCityEn(String cityEn) { this.cityEn = cityEn; }
  public void setCityFr(String cityFr) { this.cityFr = cityFr; }
  public void setDegreeEn(String degreeEn) { this.degreeEn = degreeEn; }
  public void setDegreeFr(String degreeFr) { this.degreeFr = degreeFr; }
  public void setCountryEn(String countryEn) { this.countryEn = countryEn; }
  public void setCountryFr(String countryFr) { this.countryFr = countryFr; }
  public void setStartDate(String startDate) { this.startDate = startDate; }
  public void setEndDate(String endDate) { this.endDate = endDate; }
  public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
