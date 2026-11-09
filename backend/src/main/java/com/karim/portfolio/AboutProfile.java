package com.karim.portfolio;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "about_profile")
public class AboutProfile {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String summary;
  private String goals;
  private String professionalInterests;
  private String personalInterests;

  public Long getId() { return id; }
  public String getSummary() { return summary; }
  public String getGoals() { return goals; }
  public String getProfessionalInterests() { return professionalInterests; }
  public String getPersonalInterests() { return personalInterests; }
}
