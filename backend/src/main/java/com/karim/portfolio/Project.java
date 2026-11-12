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
  private String slug;
  private String nameEn;
  private String nameFr;
  private String summaryEn;
  private String summaryFr;
  private String tagsEn;
  private String tagsFr;
  private String href;
  private String categoryEn;
  private String categoryFr;
  private String statusEn;
  private String statusFr;
  private String coverImageUrl;
  private String liveDemoUrl;
  private String roleEn;
  private String roleFr;
  private String overviewEn;
  private String overviewFr;
  private String problemEn;
  private String problemFr;
  private String architectureImageUrl;
  private String architectureCaptionEn;
  private String architectureCaptionFr;
  private String featuresEn;
  private String featuresFr;
  private String tradeoffsEn;
  private String tradeoffsFr;
  private String challengesEn;
  private String challengesFr;
  private String testingEn;
  private String testingFr;
  private String galleryUrls;
  private String lessonsEn;
  private String lessonsFr;
  private String mark;
  private Integer sortOrder;

  public Long getId() { return id; }
  public String getSlug() { return slug; }
  public String getNameEn() { return nameEn; }
  public String getNameFr() { return nameFr; }
  public String getSummaryEn() { return summaryEn; }
  public String getSummaryFr() { return summaryFr; }
  public String getTagsEn() { return tagsEn; }
  public String getTagsFr() { return tagsFr; }
  public String getHref() { return href; }
  public String getCategoryEn() { return categoryEn; }
  public String getCategoryFr() { return categoryFr; }
  public String getStatusEn() { return statusEn; }
  public String getStatusFr() { return statusFr; }
  public String getCoverImageUrl() { return coverImageUrl; }
  public String getLiveDemoUrl() { return liveDemoUrl; }
  public String getRoleEn() { return roleEn; }
  public String getRoleFr() { return roleFr; }
  public String getOverviewEn() { return overviewEn; }
  public String getOverviewFr() { return overviewFr; }
  public String getProblemEn() { return problemEn; }
  public String getProblemFr() { return problemFr; }
  public String getArchitectureImageUrl() { return architectureImageUrl; }
  public String getArchitectureCaptionEn() { return architectureCaptionEn; }
  public String getArchitectureCaptionFr() { return architectureCaptionFr; }
  public String getFeaturesEn() { return featuresEn; }
  public String getFeaturesFr() { return featuresFr; }
  public String getTradeoffsEn() { return tradeoffsEn; }
  public String getTradeoffsFr() { return tradeoffsFr; }
  public String getChallengesEn() { return challengesEn; }
  public String getChallengesFr() { return challengesFr; }
  public String getTestingEn() { return testingEn; }
  public String getTestingFr() { return testingFr; }
  public String getGalleryUrls() { return galleryUrls; }
  public String getLessonsEn() { return lessonsEn; }
  public String getLessonsFr() { return lessonsFr; }
  public String getMark() { return mark; }
  public Integer getSortOrder() { return sortOrder; }

  public void setSlug(String slug) { this.slug = slug; }
  public void setNameEn(String nameEn) { this.nameEn = nameEn; }
  public void setNameFr(String nameFr) { this.nameFr = nameFr; }
  public void setSummaryEn(String summaryEn) { this.summaryEn = summaryEn; }
  public void setSummaryFr(String summaryFr) { this.summaryFr = summaryFr; }
  public void setTagsEn(String tagsEn) { this.tagsEn = tagsEn; }
  public void setTagsFr(String tagsFr) { this.tagsFr = tagsFr; }
  public void setHref(String href) { this.href = href; }
  public void setCategoryEn(String categoryEn) { this.categoryEn = categoryEn; }
  public void setCategoryFr(String categoryFr) { this.categoryFr = categoryFr; }
  public void setStatusEn(String statusEn) { this.statusEn = statusEn; }
  public void setStatusFr(String statusFr) { this.statusFr = statusFr; }
  public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
  public void setLiveDemoUrl(String liveDemoUrl) { this.liveDemoUrl = liveDemoUrl; }
  public void setRoleEn(String roleEn) { this.roleEn = roleEn; }
  public void setRoleFr(String roleFr) { this.roleFr = roleFr; }
  public void setOverviewEn(String overviewEn) { this.overviewEn = overviewEn; }
  public void setOverviewFr(String overviewFr) { this.overviewFr = overviewFr; }
  public void setProblemEn(String problemEn) { this.problemEn = problemEn; }
  public void setProblemFr(String problemFr) { this.problemFr = problemFr; }
  public void setArchitectureImageUrl(String architectureImageUrl) {
    this.architectureImageUrl = architectureImageUrl;
  }
  public void setArchitectureCaptionEn(String architectureCaptionEn) {
    this.architectureCaptionEn = architectureCaptionEn;
  }
  public void setArchitectureCaptionFr(String architectureCaptionFr) {
    this.architectureCaptionFr = architectureCaptionFr;
  }
  public void setFeaturesEn(String featuresEn) { this.featuresEn = featuresEn; }
  public void setFeaturesFr(String featuresFr) { this.featuresFr = featuresFr; }
  public void setTradeoffsEn(String tradeoffsEn) { this.tradeoffsEn = tradeoffsEn; }
  public void setTradeoffsFr(String tradeoffsFr) { this.tradeoffsFr = tradeoffsFr; }
  public void setChallengesEn(String challengesEn) { this.challengesEn = challengesEn; }
  public void setChallengesFr(String challengesFr) { this.challengesFr = challengesFr; }
  public void setTestingEn(String testingEn) { this.testingEn = testingEn; }
  public void setTestingFr(String testingFr) { this.testingFr = testingFr; }
  public void setGalleryUrls(String galleryUrls) { this.galleryUrls = galleryUrls; }
  public void setLessonsEn(String lessonsEn) { this.lessonsEn = lessonsEn; }
  public void setLessonsFr(String lessonsFr) { this.lessonsFr = lessonsFr; }
  public void setMark(String mark) { this.mark = mark; }
  public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
