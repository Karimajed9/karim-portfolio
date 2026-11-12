package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class MediaFilesTest {

  @Test
  void acceptsCommonImageTypesAndMagicBytes() {
    assertTrue(MediaFiles.allowedImage("image/png", "cover.PNG"));
    assertTrue(MediaFiles.allowedImage("application/octet-stream", "hero.webp"));
    assertFalse(MediaFiles.allowedImage("application/pdf", "resume.pdf"));

    byte[] png = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    byte[] jpeg = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0, 0, 0, 0, 0, 0, 0};
    assertTrue(MediaFiles.looksLikeImage(png));
    assertTrue(MediaFiles.looksLikeImage(jpeg));
    assertFalse(MediaFiles.looksLikeImage("%PDF-1.4xxxx".getBytes()));
  }
}
