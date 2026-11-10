package com.karim.portfolio.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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
      Path target = root.resolve(key).normalize();
      if (!target.startsWith(root.normalize())) {
        throw new IllegalArgumentException("Refusing path traversal in key: " + key);
      }
      Files.createDirectories(target.getParent() != null ? target.getParent() : root);
      Files.copy(data, target, StandardCopyOption.REPLACE_EXISTING);
      // file:/// URL is fine for local demos; production will use Azure HTTPS URLs.
      String url = target.toUri().toString();
      log.info("Stored local blob key={} path={}", key, target);
      return new StoredBlob(key, url);
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to store local blob: " + key, e);
    }
  }
}
