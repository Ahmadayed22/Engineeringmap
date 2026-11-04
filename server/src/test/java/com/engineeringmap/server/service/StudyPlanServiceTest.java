package com.engineeringmap.server.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.engineeringmap.server.entity.StudyPlan;
import com.engineeringmap.server.repo.PlannedCourseRepo;
import com.engineeringmap.server.repo.StudyMapRepo;
import com.engineeringmap.server.repo.StudyPlanImageRepo;
import com.engineeringmap.server.repo.StudyPlanRepo;

/** Rules that are awkward to reach through HTTP on the shared test database. */
class StudyPlanServiceTest {

    @Test
    void theLastRoadmapCannotBeRemoved() {
        StudyPlanRepo plans = mock(StudyPlanRepo.class);
        StudyMapRepo maps = mock(StudyMapRepo.class);
        StudyPlan only = new StudyPlan();
        only.setSlug("cpe");
        when(plans.findBySlug("cpe")).thenReturn(Optional.of(only));
        when(plans.count()).thenReturn(1L);
        StudyPlanService service = new StudyPlanService(plans, mock(StudyMapService.class), maps,
                mock(PlannedCourseRepo.class), mock(StudyPlanImageRepo.class));

        assertThatThrownBy(() -> service.delete("cpe"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(StudyPlanService.LAST_PLAN);
        verify(maps, never()).deleteByPlan("cpe");
        verify(plans, never()).delete(only);
    }

    @Test
    void picturesAreRecognisedByTheirContent() {
        assertThat(StudyPlanService.imageType(new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0})).isEqualTo("image/jpeg");
        assertThat(StudyPlanService.imageType(new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A}))
                .isEqualTo("image/png");
        assertThat(StudyPlanService.imageType("RIFF\0\0\0\0WEBPVP8 ".getBytes())).isEqualTo("image/webp");
        assertThat(StudyPlanService.imageType("GIF89a......".getBytes())).isNull();
        assertThat(StudyPlanService.imageType("<html>".getBytes())).isNull();
        assertThat(StudyPlanService.imageType(new byte[0])).isNull();
    }

    @Test
    void idsAreMadeFromTheEnglishName() {
        assertThat(StudyPlanService.slugify("Computer Engineering 2026")).isEqualTo("computer-engineering-2026");
        assertThat(StudyPlanService.slugify("  Électrique & Power!! ")).isEqualTo("electrique-power");
        assertThat(StudyPlanService.slugify("هندسة")).isEqualTo("plan");
    }
}
