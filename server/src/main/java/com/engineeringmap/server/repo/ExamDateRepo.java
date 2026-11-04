package com.engineeringmap.server.repo;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.ExamDate;

public interface ExamDateRepo extends JpaRepository<ExamDate, Long> {
    List<ExamDate> findByUserIdOrderByStartsAtAsc(Long userId);

    long countByUserId(Long userId);

    /** Exams still ahead that start before {@code until} and have not had every reminder yet. */
    @Query("""
            select e from ExamDate e join fetch e.user
            where e.remindersSent < 2 and e.startsAt > :now and e.startsAt <= :until""")
    List<ExamDate> dueForReminder(@Param("now") Instant now, @Param("until") Instant until);
}
