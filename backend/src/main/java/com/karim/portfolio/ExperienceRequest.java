package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExperienceRequest(
    @NotBlank String company,
    @NotBlank String role,
    @NotBlank String startDate,
    @NotBlank String endDate,
    @NotBlank String location,
    @NotNull String highlights,
    @NotNull Integer sortOrder
) {}
