package com.engineeringmap.server.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.engineeringmap.server.entity.StudyPlanImage;

public interface StudyPlanImageRepo extends JpaRepository<StudyPlanImage, String> {
}
