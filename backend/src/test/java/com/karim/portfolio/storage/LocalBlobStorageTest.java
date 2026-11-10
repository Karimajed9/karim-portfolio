package com.karim.portfolio.storage;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalBlobStorageTest {

	@TempDir
	Path tempDir;

	@Test
	void storesFileUnderRootAndReturnsUri() throws Exception {
		LocalBlobStorage storage = new LocalBlobStorage(tempDir);
		byte[] bytes = "hello-blob".getBytes(StandardCharsets.UTF_8);

		StoredBlob stored = storage.store(
				"projects/demo.txt",
				"text/plain",
				new ByteArrayInputStream(bytes),
				bytes.length);

		Path expected = tempDir.resolve("projects/demo.txt");
		assertEquals("projects/demo.txt", stored.key());
		assertTrue(Files.exists(expected));
		assertEquals("hello-blob", Files.readString(expected));
		assertTrue(stored.url().startsWith("file:"));
		assertTrue(stored.url().contains("demo.txt"));
	}

	@Test
	void rejectsPathTraversal() {
		LocalBlobStorage storage = new LocalBlobStorage(tempDir);
		byte[] bytes = "x".getBytes(StandardCharsets.UTF_8);

		assertThrows(IllegalArgumentException.class, () -> storage.store(
				"../outside.txt",
				"text/plain",
				new ByteArrayInputStream(bytes),
				bytes.length));
	}
}
