package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class MavenWrapperFetchTest {

  @Test
  void wgetFailureFallsBackToCurl() throws Exception {
    Path script = Path.of(".mvn/wrapper/fetch-dist-scenarios.sh").toAbsolutePath().normalize();
    assertTrue(Files.isRegularFile(script), "missing " + script);

    Process process =
        new ProcessBuilder(bash(), script.toString())
            .redirectErrorStream(true)
            .start();
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    process.getInputStream().transferTo(output);
    int exit = process.waitFor();
    String text = output.toString(StandardCharsets.UTF_8);

    assertEquals(0, exit, text);
    assertTrue(text.contains("wget-fails-curl-fetches"), text);
    assertTrue(text.contains("wget-fetches-without-curl"), text);
    assertTrue(text.contains("both-fail"), text);
    assertTrue(text.contains("mvnw-uses-fallback"), text);
  }

  private static String bash() {
    List<String> candidates = new ArrayList<>();
    candidates.add("bash");
    String programFiles = System.getenv("ProgramFiles");
    if (programFiles != null) {
      candidates.add(programFiles + "\\Git\\bin\\bash.exe");
    }
    candidates.add("C:\\Program Files\\Git\\bin\\bash.exe");
    for (String candidate : candidates) {
      if ("bash".equals(candidate) || Files.isRegularFile(Path.of(candidate))) {
        return candidate;
      }
    }
    return "bash";
  }
}
