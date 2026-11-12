package com.karim.portfolio;

import java.util.Locale;
import java.util.Set;

/** Rules for public project media stored under {@code uploads/}. */
public final class MediaFiles {

  public static final long MAX_BYTES = 5L * 1024 * 1024;

  public static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif");

  private MediaFiles() {}

  public static boolean isUploadKey(String key) {
    return key != null && key.startsWith("uploads/") && !key.contains("..");
  }

  public static String publicPath(String key) {
    return "/media/" + key;
  }

  public static boolean allowedImage(String contentType, String filename) {
    String type = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT).trim();
    if (ALLOWED_CONTENT_TYPES.contains(type)) {
      return true;
    }
    String name = filename == null ? "" : filename.toLowerCase(Locale.ROOT);
    return name.endsWith(".jpg")
        || name.endsWith(".jpeg")
        || name.endsWith(".png")
        || name.endsWith(".webp")
        || name.endsWith(".gif");
  }

  /** Lightweight magic-byte check for JPEG / PNG / GIF / WebP. */
  public static boolean looksLikeImage(byte[] bytes) {
    if (bytes == null || bytes.length < 12) {
      return false;
    }
    // JPEG
    if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
      return true;
    }
    // PNG
    if (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
      return true;
    }
    // GIF
    if (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F') {
      return true;
    }
    // WebP: RIFF....WEBP
    return bytes[0] == 'R'
        && bytes[1] == 'I'
        && bytes[2] == 'F'
        && bytes[3] == 'F'
        && bytes[8] == 'W'
        && bytes[9] == 'E'
        && bytes[10] == 'B'
        && bytes[11] == 'P';
  }
}
