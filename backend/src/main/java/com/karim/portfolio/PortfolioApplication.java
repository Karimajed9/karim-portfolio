package com.karim.portfolio;

import com.microsoft.applicationinsights.attach.ApplicationInsights;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PortfolioApplication {

	public static void main(String[] args) {
		// Attach only when a connection string is present — otherwise local/Docker stay quiet
		// and no App Insights resource is required. Must run before SpringApplication.run.
		String ai = System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING");
		if (ai != null && !ai.isBlank()) {
			ApplicationInsights.attach();
		}
		SpringApplication.run(PortfolioApplication.class, args);
	}

}
