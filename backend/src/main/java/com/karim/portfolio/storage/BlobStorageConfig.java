package com.karim.portfolio.storage;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Picks Postgres vs Azure Blob based on {@code app.storage.mode} and whether
 * Azure credentials are present. Without Azure, bytes go in {@code stored_blob}
 * so a Render restart does not 404 {@code /media/uploads/...}.
 */
@Configuration
@EnableConfigurationProperties(BlobStorageProperties.class)
public class BlobStorageConfig {

  private static final Logger log = LoggerFactory.getLogger(BlobStorageConfig.class);

  @Bean
  BlobStorage blobStorage(BlobStorageProperties props, JdbcTemplate jdbc) {
    String mode = props.getMode() == null ? "auto" : props.getMode().trim().toLowerCase();
    boolean wantAzure = switch (mode) {
      case "azure" -> true;
      case "local" -> false;
      default -> props.getAzure().isConfigured();
    };

    if (wantAzure) {
      if (!props.getAzure().isConfigured()) {
        throw new IllegalStateException(
            "app.storage.mode=azure but neither AZURE_STORAGE_CONNECTION_STRING "
                + "nor AZURE_STORAGE_ACCOUNT_NAME is set");
      }
      log.info("BlobStorage: using Azure container '{}'", props.getAzure().getContainer());
      return new AzureBlobStorage(buildContainer(props));
    }

    log.info("BlobStorage: using database table stored_blob");
    return new DatabaseBlobStorage(jdbc);
  }

  private static BlobContainerClient buildContainer(BlobStorageProperties props) {
    var azure = props.getAzure();
    BlobServiceClientBuilder builder = new BlobServiceClientBuilder();
    if (azure.hasConnectionString()) {
      builder.connectionString(azure.getConnectionString());
    } else {
      builder
          .endpoint("https://" + azure.getAccountName() + ".blob.core.windows.net")
          .credential(new DefaultAzureCredentialBuilder().build());
    }
    BlobContainerClient container = builder.buildClient().getBlobContainerClient(azure.getContainer());
    // Dev convenience; in PW-10 prefer creating the container once via portal/Bicep.
    container.createIfNotExists();
    return container;
  }
}
