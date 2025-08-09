package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.engineeringmap.server.entity.Resource;

public interface ResourceRepo extends JpaRepository<Resource,Long>{
    List<Resource> findByCourseId(Long courseId);
    
} 
