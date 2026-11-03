package com.engineeringmap.server;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Boots the whole application against the in-memory H2 "local" profile
 * (src/test/resources/application-local.properties), so it runs without Postgres.
 */
@SpringBootTest
@ActiveProfiles("local")
class ServerApplicationTests {

	@Test
	void contextLoads() {
	}

}
