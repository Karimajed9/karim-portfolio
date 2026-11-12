package com.karim.portfolio.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Writes uploads under a local directory (default {@code ./data/uploads}).
 * Used whenever Azure Blob is not configured — no cloud cost, good for learning.
 */
public class LocalBlobStorage implements BlobStorage {

  private static final Logger log = LoggerFactory.getLogger(LocalBlobStorage.class);

  private final Path root;

  public LocalBlobStorage(Path root) {
    this.root = root;
  }

  Path root() {
    return root;
  }

  @Override
  public StoredBlob store(String key, String contentType, InputStream data, long contentLength) {
    try {
      Path target = resolveKey(key);
      Files.createDirectories(target.getParent() != null ? target.getParent() : root);
      Files.copy(data, target, StandardCopyOption.REPLACE_EXISTING);
      String url = target.toUri().toString();
      log.info("Stored local blob key={} path={}", key, target);
      return new StoredBlob(key, url);
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to store local blob: " + key, e);
    }
  }

  @Override
  public Optional<StoredBlobContent> open(String key) {
    try {
      Path target = resolveKey(key);
      if (!Files.isRegularFile(target)) {
        return Optional.empty();
      }
      long size = Files.size(target);
      String contentType = Files.probeContentType(target);
      InputStream stream = Files.newInputStream(target);
      return Optional.of(new StoredBlobContent(
          contentType != null ? contentType : "application/octet-stream",
          size,
          stream));
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to open local blob: " + key, e);
    }
  }

  private Path resolveKey(String key) {
    Path target = root.resolve(key).normalize();
    if (!target.startsWith(root.normalize())) {
      throw new IllegalArgumentException("Refusing path traversal in key: " + key);
    }
    return target;
  }
}
