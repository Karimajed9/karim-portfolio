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

    String bash = bash();
    Process process =
        new ProcessBuilder(bash, scriptForBash(script, bash))
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

  /**
   * Git Bash keeps Windows paths. A bare {@code bash} on PATH is often WSL, and that
   * launcher treats {@code \} as an escape, so {@code C:\Users\...} becomes {@code C:Users...}.
   */
  private static String bash() {
    List<String> candidates = new ArrayList<>();
    String programFiles = System.getenv("ProgramFiles");
    if (programFiles != null) {
      candidates.add(programFiles + "\\Git\\bin\\bash.exe");
    }
    candidates.add("C:\\Program Files\\Git\\bin\\bash.exe");
    for (String candidate : candidates) {
      if (Files.isRegularFile(Path.of(candidate))) {
        return candidate;
      }
    }
    return "bash";
  }

  private static String scriptForBash(Path script, String bash) {
    String path = script.toString().replace('\\', '/');
    boolean gitBash = bash.replace('\\', '/').toLowerCase().contains("/git/bin/bash");
    if (!gitBash && path.length() >= 3 && path.charAt(1) == ':') {
      char drive = Character.toLowerCase(path.charAt(0));
      return "/mnt/" + drive + path.substring(2);
    }
    return path;
  }
}
