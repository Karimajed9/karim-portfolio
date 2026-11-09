package com.karim.portfolio;

import java.util.List;

public record AboutResponse(
    String summary,
    String goals,
    String professionalInterests,
    String personalInterests,
    List<Education> education
) {}
