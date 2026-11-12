package com.karim.portfolio;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/** Stable public CV filenames and storage keys the site already links. */
public final class CvFiles {

  public static final String EN_FILENAME = "Karim_Majed_Backend_CV_Final.pdf";
  public static final String FR_FILENAME = "Karim_Majed_Backend_CV_FR.pdf";

  public static final String EN_KEY = "cv/" + EN_FILENAME;
  public static final String FR_KEY = "cv/" + FR_FILENAME;

  public static final long MAX_BYTES = 5L * 1024 * 1024;

  private static final Map<String, String> SLOT_TO_KEY = Map.of(
      "cv-en", EN_KEY,
      "cv-fr", FR_KEY,
      "en", EN_KEY,
      "fr", FR_KEY);

  private CvFiles() {}

  public static Optional<String> keyForSlot(String slot) {
    if (slot == null || slot.isBlank()) {
      return Optional.empty();
    }
    return Optional.ofNullable(SLOT_TO_KEY.get(slot.trim().toLowerCase(Locale.ROOT)));
  }

  public static Optional<String> keyForFilename(String filename) {
    if (EN_FILENAME.equals(filename)) {
      return Optional.of(EN_KEY);
    }
    if (FR_FILENAME.equals(filename)) {
      return Optional.of(FR_KEY);
    }
    return Optional.empty();
  }

  public static String publicPath(String key) {
    return "/" + key;
  }
}
