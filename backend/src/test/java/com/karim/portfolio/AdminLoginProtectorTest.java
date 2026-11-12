package com.karim.portfolio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class AdminLoginProtectorTest {

	@Test
	void locksAfterMaxFailuresAndClearsOnSuccess() {
		AdminLoginProtector protector = new AdminLoginProtector(3, 60_000);
		String client = "10.0.0.1";

		assertFalse(protector.isLocked(client));
		protector.recordFailure(client);
		protector.recordFailure(client);
		assertFalse(protector.isLocked(client));
		protector.recordFailure(client);
		assertTrue(protector.isLocked(client));

		protector.recordSuccess(client);
		assertFalse(protector.isLocked(client));
	}

	@Test
	void constantTimeEqualsMatchesEqualStrings() {
		assertTrue(AdminAuthController.constantTimeEquals("admin", "admin"));
		assertFalse(AdminAuthController.constantTimeEquals("admin", "Admin"));
		assertFalse(AdminAuthController.constantTimeEquals("admin", "adm"));
	}
}
