package com.engineeringmap.server.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.engineeringmap.server.entity.Role;
import com.engineeringmap.server.entity.RoleType;





public interface RoleRepo extends JpaRepository<Role,Long> {

    Optional<Role> findByName(RoleType name);
    
} 
