package com.karim.portfolio;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(PostgresTestcontainersConfig.class)
class PortfolioApplicationTests {

	@Test
	void contextLoads() {
	}

}
