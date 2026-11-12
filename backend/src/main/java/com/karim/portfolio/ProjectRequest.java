package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(
    @NotBlank String nameEn,
    String nameFr,
    @NotBlank String summaryEn,
    String summaryFr,
    String tagsEn,
    String tagsFr,
    String href
) {}
