package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EducationRequest(
    @NotBlank String school,
    @NotBlank String city,
    @NotBlank String degree,
    @NotBlank String country,
    @NotBlank String startDate,
    @NotBlank String endDate,
    @NotNull Integer sortOrder
) {}
