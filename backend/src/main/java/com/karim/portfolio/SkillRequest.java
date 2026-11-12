package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SkillRequest(
    @NotBlank String category,
    @NotBlank String name,
    @NotNull Integer sortOrder
) {}
