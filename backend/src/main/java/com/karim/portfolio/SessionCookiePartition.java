package com.karim.portfolio;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import org.springframework.boot.web.servlet.ServletContextInitializer;

/**
 * Phones block the cross-site admin cookie unless it is Partitioned (CHIPS).
 * Partitioned is only valid with Secure and SameSite=None, which is the
 * production cross-site setup (www.karimmajed.com → the API host).
 */
public final class SessionCookiePartition {

  static final String ATTRIBUTE = "Partitioned";

  private SessionCookiePartition() {}

  public static boolean shouldPartition(boolean secure, String sameSite) {
    return secure && sameSite != null && "none".equalsIgnoreCase(sameSite.trim());
  }

  public static ServletContextInitializer initializer(boolean secure, String sameSite) {
    return new ServletContextInitializer() {
      @Override
      public void onStartup(ServletContext servletContext) throws ServletException {
        if (!shouldPartition(secure, sameSite)) {
          return;
        }
        // Empty value: Tomcat emits a valueless "; Partitioned" attribute.
        servletContext.getSessionCookieConfig().setAttribute(ATTRIBUTE, "");
      }
    };
  }
}
