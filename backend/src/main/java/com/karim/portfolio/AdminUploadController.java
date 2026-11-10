package com.karim.portfolio;

import com.karim.portfolio.storage.BlobStorage;
import com.karim.portfolio.storage.StoredBlob;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Thin admin hook to exercise {@link BlobStorage} before a full project-image UI exists.
 * Requires Basic auth ({@code ADMIN} role). Does not change project entities yet.
 */
@RestController
public class AdminUploadController {

  private final BlobStorage blobStorage;

  public AdminUploadController(BlobStorage blobStorage) {
    this.blobStorage = blobStorage;
  }

  @PostMapping(path = "/api/admin/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("file is required");
    }
    String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.bin";
    String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
    String key = "uploads/" + UUID.randomUUID() + "-" + safeName;
    StoredBlob stored = blobStorage.store(
        key,
        file.getContentType(),
        file.getInputStream(),
        file.getSize());
    return Map.of("key", stored.key(), "url", stored.url());
  }
}
