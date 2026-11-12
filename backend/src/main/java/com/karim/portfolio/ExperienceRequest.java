package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExperienceRequest(
    @NotBlank String companyEn,
    String companyFr,
    @NotBlank String roleEn,
    String roleFr,
    @NotBlank String startDate,
    @NotBlank String endDate,
    @NotBlank String locationEn,
    String locationFr,
    @NotNull String highlightsEn,
    String highlightsFr,
    @NotNull Integer sortOrder
) {}
