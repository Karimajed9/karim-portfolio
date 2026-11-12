package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProjectRequest(
    @NotBlank String slug,
    @NotBlank String nameEn,
    String nameFr,
    @NotBlank String summaryEn,
    String summaryFr,
    String tagsEn,
    String tagsFr,
    String href,
    String categoryEn,
    String categoryFr,
    String statusEn,
    String statusFr,
    String coverImageUrl,
    String liveDemoUrl,
    String roleEn,
    String roleFr,
    String overviewEn,
    String overviewFr,
    String problemEn,
    String problemFr,
    String architectureImageUrl,
    String architectureCaptionEn,
    String architectureCaptionFr,
    String featuresEn,
    String featuresFr,
    String tradeoffsEn,
    String tradeoffsFr,
    String challengesEn,
    String challengesFr,
    String testingEn,
    String testingFr,
    String galleryUrls,
    String lessonsEn,
    String lessonsFr,
    String mark,
    @NotNull Integer sortOrder
) {}
