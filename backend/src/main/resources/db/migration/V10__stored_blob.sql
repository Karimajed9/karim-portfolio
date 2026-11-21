-- Uploaded covers and CV files. Render's container disk is wiped on restart,
-- so /media and /cv bytes live in Postgres with the rest of the content.

CREATE TABLE stored_blob (
  storage_key VARCHAR(500) PRIMARY KEY,
  content_type VARCHAR(120) NOT NULL,
  payload BYTEA NOT NULL
);
