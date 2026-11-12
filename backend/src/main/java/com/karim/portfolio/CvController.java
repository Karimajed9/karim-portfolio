package com.karim.portfolio;

import com.karim.portfolio.storage.BlobStorage;
import com.karim.portfolio.storage.StoredBlobContent;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/**
 * Serves the two downloadable CV PDFs at stable {@code /cv/...} paths.
 * Prefers an admin-uploaded blob; falls back to classpath seed copies.
 */
@RestController
public class CvController {

  private final BlobStorage blobStorage;

  public CvController(BlobStorage blobStorage) {
    this.blobStorage = blobStorage;
  }

  @GetMapping("/cv/{filename}")
  public ResponseEntity<Resource> download(@PathVariable String filename) throws IOException {
    String key = CvFiles.keyForFilename(filename)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    var uploaded = blobStorage.open(key);
    if (uploaded.isPresent()) {
      StoredBlobContent content = uploaded.get();
      return pdfResponse(filename, content.contentLength(), content.stream());
    }

    ClassPathResource seed = new ClassPathResource(key);
    if (!seed.exists()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    long length = seed.contentLength();
    return pdfResponse(filename, length, seed.getInputStream());
  }

  private static ResponseEntity<Resource> pdfResponse(
      String filename, long length, InputStream stream) {
    InputStreamResource body = new InputStreamResource(stream);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .contentLength(length)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
        .body(body);
  }
}
