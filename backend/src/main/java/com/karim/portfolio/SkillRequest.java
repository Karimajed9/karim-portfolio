package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SkillRequest(
    @NotBlank String categoryEn,
    String categoryFr,
    @NotBlank String nameEn,
    String nameFr,
    @NotNull Integer sortOrder
) {}
