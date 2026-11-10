package com.karim.portfolio;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Shared Postgres for {@code @SpringBootTest}. {@code @ServiceConnection} wires
 * JDBC URL/user/password so Flyway + JPA talk to the container instead of localhost.
 */
@TestConfiguration(proxyBeanMethods = false)
class PostgresTestcontainersConfig {

	@Bean
	@ServiceConnection
	PostgreSQLContainer postgres() {
		return new PostgreSQLContainer("postgres:16-alpine");
	}
}
