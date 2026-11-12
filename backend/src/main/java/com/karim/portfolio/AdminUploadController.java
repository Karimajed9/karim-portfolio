package com.karim.portfolio;

import com.karim.portfolio.storage.BlobStorage;
import com.karim.portfolio.storage.StoredBlob;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Admin multipart uploads. Optional {@code slot=cv-en|cv-fr} overwrites the
 * stable public CV PDFs; otherwise stores under a unique uploads/ key.
 */
@RestController
public class AdminUploadController {

  private final BlobStorage blobStorage;
  private final ContentRevision contentRevision;

  public AdminUploadController(BlobStorage blobStorage, ContentRevision contentRevision) {
    this.blobStorage = blobStorage;
    this.contentRevision = contentRevision;
  }

  @PostMapping(path = "/api/admin/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, String> upload(
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "slot", required = false) String slot) throws IOException {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
    }

    var cvKey = CvFiles.keyForSlot(slot);
    if (cvKey.isPresent()) {
      return storeCv(file, cvKey.get());
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

  private Map<String, String> storeCv(MultipartFile file, String key) throws IOException {
    if (file.getSize() > CvFiles.MAX_BYTES) {
      throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "PDF too large");
    }

    String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
    String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
    boolean pdfType = contentType.equals("application/pdf") || contentType.equals("application/x-pdf");
    boolean pdfName = name.endsWith(".pdf");
    if (!pdfType && !pdfName) {
      throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "PDF only");
    }

    byte[] bytes = file.getBytes();
    if (bytes.length > CvFiles.MAX_BYTES) {
      throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "PDF too large");
    }
    if (bytes.length < 5
        || bytes[0] != '%'
        || bytes[1] != 'P'
        || bytes[2] != 'D'
        || bytes[3] != 'F'
        || bytes[4] != '-') {
      throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "PDF only");
    }

    StoredBlob stored = blobStorage.store(
        key,
        MediaType.APPLICATION_PDF_VALUE,
        new ByteArrayInputStream(bytes),
        bytes.length);
    contentRevision.bump();

    String filename = key.substring(key.lastIndexOf('/') + 1);
    return Map.of(
        "key", stored.key(),
        "url", CvFiles.publicPath(key),
        "filename", filename);
  }
}
