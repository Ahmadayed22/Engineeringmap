package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.TimetableEntry;

public interface TimetableEntryRepo extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findByUserIdOrderByDayOfWeekAscStartMinuteAsc(Long userId);

    @Modifying
    @Query("delete from TimetableEntry t where t.user.id = :userId")
    void deleteByUser(@Param("userId") Long userId);
}
