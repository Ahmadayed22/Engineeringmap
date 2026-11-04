package com.engineeringmap.server.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.engineeringmap.server.entity.PastExamFile;

public interface PastExamFileRepo extends JpaRepository<PastExamFile, Long> {
}
