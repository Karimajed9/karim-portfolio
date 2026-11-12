package com.karim.portfolio;

import com.karim.portfolio.storage.BlobStorage;
import com.karim.portfolio.storage.StoredBlobContent;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Public read access for admin-uploaded project media under {@code /media/uploads/...}. */
@RestController
public class MediaController {

  private final BlobStorage blobStorage;

  public MediaController(BlobStorage blobStorage) {
    this.blobStorage = blobStorage;
  }

  @GetMapping("/media/{*resourcePath}")
  public ResponseEntity<Resource> get(@PathVariable("resourcePath") String resourcePath) {
    String key = resourcePath.startsWith("/") ? resourcePath.substring(1) : resourcePath;
    if (!MediaFiles.isUploadKey(key)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    StoredBlobContent content = blobStorage.open(key)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    MediaType mediaType;
    try {
      mediaType = MediaType.parseMediaType(content.contentType());
    } catch (Exception ex) {
      mediaType = MediaType.APPLICATION_OCTET_STREAM;
    }

    return ResponseEntity.ok()
        .contentType(mediaType)
        .contentLength(content.contentLength())
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
        .body(new InputStreamResource(content.stream()));
  }
}
