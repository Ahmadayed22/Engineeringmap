package com.engineeringmap.server.repo;

import com.engineeringmap.server.entity.DrEmail;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


@Repository
public interface DrEmailRepo extends JpaRepository<DrEmail, Long>, JpaSpecificationExecutor<DrEmail> {
}