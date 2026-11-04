package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationState;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.repo.RoleRepo;

/**
 * The schema comes from the Flyway scripts in src/main/resources/db/migration and Hibernate runs
 * with ddl-auto=validate, so the context starting at all means the scripts match the entities.
 * This checks the rest: every script ran and the roles sign-up depends on exist.
 */
@SpringBootTest
@ActiveProfiles("local")
class MigrationsTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private RoleRepo roleRepo;

    @Test
    void allMigrationsApplied() {
        MigrationInfo[] applied = flyway.info().applied();
        assertThat(applied).isNotEmpty();
        assertThat(applied).allMatch(m -> m.getState() == MigrationState.SUCCESS);
        assertThat(flyway.info().pending()).isEmpty();
        // Versioned scripts only; the local profile also runs a repeatable (unversioned) demo-data script.
        assertThat(Arrays.stream(applied)
                .filter(m -> m.getVersion() != null)
                .map(m -> m.getVersion().getVersion()))
                .containsExactly("1", "2", "3", "4", "5");
    }

    @Test
    void rolesAreSeeded() {
        assertThat(roleRepo.findByName(RoleType.USER)).isPresent();
        assertThat(roleRepo.findByName(RoleType.ADMIN)).isPresent();
        assertThat(roleRepo.count()).isEqualTo(2);
    }
}
