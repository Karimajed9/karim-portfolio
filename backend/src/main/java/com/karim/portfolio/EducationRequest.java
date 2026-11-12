package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EducationRequest(
    @NotBlank String schoolEn,
    String schoolFr,
    @NotBlank String cityEn,
    String cityFr,
    @NotBlank String degreeEn,
    String degreeFr,
    @NotBlank String countryEn,
    String countryFr,
    @NotBlank String startDate,
    @NotBlank String endDate,
    @NotNull Integer sortOrder
) {}
