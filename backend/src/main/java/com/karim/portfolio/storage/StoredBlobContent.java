package com.karim.portfolio.storage;

import java.io.InputStream;

/** Readable blob payload for public downloads (e.g. CV PDFs). */
public record StoredBlobContent(String contentType, long contentLength, InputStream stream) {}
