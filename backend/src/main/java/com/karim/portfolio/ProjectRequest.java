package com.karim.portfolio;

import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(
    @NotBlank String name,
    @NotBlank String summary,
    String tags,
    String href
) {}
