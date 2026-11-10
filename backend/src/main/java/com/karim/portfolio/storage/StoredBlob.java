package com.karim.portfolio.storage;

/**
 * Result of a successful store: the key used in the backend and a URL/path
 * the frontend can reference later (local file URL or Azure Blob URL).
 */
public record StoredBlob(String key, String url) {
}
