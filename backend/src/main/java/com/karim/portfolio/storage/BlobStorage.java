package com.karim.portfolio.storage;

import java.io.InputStream;
import java.util.Optional;

/**
 * Abstraction for project image / file uploads.
 * <p>
 * Local runs use {@link LocalBlobStorage}; Azure is used only when storage
 * credentials are configured (see {@link BlobStorageConfig}). Controllers depend
 * on this interface so swapping backends needs no API changes.
 */
public interface BlobStorage {

  /**
   * Store a blob and return a public-or-local URL/path plus the storage key.
   *
   * @param key logical object key (e.g. {@code projects/demo.png})
   * @param contentType MIME type, may be {@code null}
   * @param data file bytes
   * @param contentLength size in bytes
   */
  StoredBlob store(String key, String contentType, InputStream data, long contentLength);

  /** Open a previously stored blob, if present. */
  Optional<StoredBlobContent> open(String key);
}
