package com.karim.portfolio.storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobProperties;
import com.azure.storage.blob.options.BlobParallelUploadOptions;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Uploads to an Azure Blob container. Only constructed when Azure credentials
 * are present — see {@link BlobStorageConfig}.
 */
public class AzureBlobStorage implements BlobStorage {

  private static final Logger log = LoggerFactory.getLogger(AzureBlobStorage.class);

  private final BlobContainerClient container;

  public AzureBlobStorage(BlobContainerClient container) {
    this.container = container;
  }

  @Override
  public StoredBlob store(String key, String contentType, InputStream data, long contentLength) {
    BlobClient client = container.getBlobClient(key);
    BlobParallelUploadOptions options = new BlobParallelUploadOptions(data, contentLength);
    if (contentType != null && !contentType.isBlank()) {
      options.setHeaders(new BlobHttpHeaders().setContentType(contentType));
    }
    client.uploadWithResponse(options, null, null);
    String url = client.getBlobUrl();
    log.info("Stored Azure blob key={} url={}", key, url);
    return new StoredBlob(key, url);
  }

  @Override
  public Optional<StoredBlobContent> open(String key) {
    BlobClient client = container.getBlobClient(key);
    if (!client.exists()) {
      return Optional.empty();
    }
    BlobProperties props = client.getProperties();
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    client.downloadStream(buffer);
    byte[] bytes = buffer.toByteArray();
    String contentType = props.getContentType();
    if (contentType == null || contentType.isBlank()) {
      contentType = "application/octet-stream";
    }
    return Optional.of(new StoredBlobContent(
        contentType,
        bytes.length,
        new ByteArrayInputStream(bytes)));
  }
}
