package com.karim.portfolio.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from {@code app.storage.*} in application.properties / env vars.
 * Secrets (connection string) come from the environment — never from git.
 */
@ConfigurationProperties(prefix = "app.storage")
public class BlobStorageProperties {

  /**
   * {@code auto} (default): Azure when credentials exist, otherwise local.
   * {@code local} / {@code azure}: force a backend.
   */
  private String mode = "auto";

  /** Directory for {@link LocalBlobStorage}. */
  private String localDir = "./data/uploads";

  private final Azure azure = new Azure();

  public String getMode() {
    return mode;
  }

  public void setMode(String mode) {
    this.mode = mode;
  }

  public String getLocalDir() {
    return localDir;
  }

  public void setLocalDir(String localDir) {
    this.localDir = localDir;
  }

  public Azure getAzure() {
    return azure;
  }

  public static class Azure {
    /** Container name inside the storage account. */
    private String container = "portfolio-uploads";

    /**
     * Connection string (preferred for local/dev smoke tests against a real account).
     * Mapped from {@code AZURE_STORAGE_CONNECTION_STRING}.
     */
    private String connectionString = "";

    /**
     * Account name for Managed Identity / DefaultAzureCredential
     * ({@code https://{account}.blob.core.windows.net}).
     * Mapped from {@code AZURE_STORAGE_ACCOUNT_NAME}.
     */
    private String accountName = "";

    public String getContainer() {
      return container;
    }

    public void setContainer(String container) {
      this.container = container;
    }

    public String getConnectionString() {
      return connectionString;
    }

    public void setConnectionString(String connectionString) {
      this.connectionString = connectionString;
    }

    public String getAccountName() {
      return accountName;
    }

    public void setAccountName(String accountName) {
      this.accountName = accountName;
    }

    boolean hasConnectionString() {
      return connectionString != null && !connectionString.isBlank();
    }

    boolean hasAccountName() {
      return accountName != null && !accountName.isBlank();
    }

    boolean isConfigured() {
      return hasConnectionString() || hasAccountName();
    }
  }
}
