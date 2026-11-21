package com.karim.portfolio.storage;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Stores upload bytes in Postgres. Render's local disk does not survive a
 * restart, so a {@code /media/uploads/...} URL has to be readable from the
 * same database that already returned the project.
 */
public class DatabaseBlobStorage implements BlobStorage {

  private static final Logger log = LoggerFactory.getLogger(DatabaseBlobStorage.class);

  private final JdbcTemplate jdbc;

  public DatabaseBlobStorage(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public StoredBlob store(String key, String contentType, InputStream data, long contentLength) {
    try {
      byte[] bytes = data.readAllBytes();
      String type = contentType == null || contentType.isBlank()
          ? "application/octet-stream"
          : contentType;
      jdbc.update(
          """
          INSERT INTO stored_blob (storage_key, content_type, payload)
          VALUES (?, ?, ?)
          ON CONFLICT (storage_key) DO UPDATE
          SET content_type = EXCLUDED.content_type,
              payload = EXCLUDED.payload
          """,
          key,
          type,
          bytes);
      log.info("Stored database blob key={} bytes={}", key, bytes.length);
      return new StoredBlob(key, "/media/" + key);
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to store database blob: " + key, e);
    }
  }

  @Override
  public Optional<StoredBlobContent> open(String key) {
    return jdbc.query(
        "SELECT content_type, payload FROM stored_blob WHERE storage_key = ?",
        rs -> {
          if (!rs.next()) {
            return Optional.empty();
          }
          byte[] payload = rs.getBytes("payload");
          if (payload == null) {
            payload = new byte[0];
          }
          String type = rs.getString("content_type");
          if (type == null || type.isBlank()) {
            type = "application/octet-stream";
          }
          return Optional.of(new StoredBlobContent(type, payload.length, new ByteArrayInputStream(payload)));
        },
        key);
  }
}
