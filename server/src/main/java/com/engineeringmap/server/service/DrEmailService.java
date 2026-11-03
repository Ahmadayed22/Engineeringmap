package com.engineeringmap.server.service;

import java.util.Set;

import com.engineeringmap.server.entity.DrEmail;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.DrEmailRepo;
import com.engineeringmap.server.util.DrEmailSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class DrEmailService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> SORTABLE_FIELDS = Set.of("id", "name", "email", "department");

    private final DrEmailRepo drEmailRepository;

    public DrEmailService(DrEmailRepo drEmailRepository) {
        this.drEmailRepository = drEmailRepository;
    }

    public Page<DrEmail> getDrEmails(int page, int size, String search, String department, String sortBy, String sortDir) {
        // Unknown sort fields used to throw (HTTP 500) and an unbounded size let one request
        // pull the whole table; clamp both.
        String field = sortBy != null && SORTABLE_FIELDS.contains(sortBy) ? sortBy : "id";
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(field).descending() : Sort.by(field).ascending();
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        String trimmedSearch = search == null ? null : search.trim();
        return drEmailRepository.findAll(DrEmailSpecification.filter(trimmedSearch, department), pageable);
    }

    public DrEmail createDrEmail(DrEmail drEmail) {
        drEmail.setId(null);
        return drEmailRepository.save(drEmail);
    }

    public DrEmail updateDrEmail(Long id, DrEmail drEmail) {
        DrEmail existing = drEmailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty email not found with id: " + id));
        existing.setName(drEmail.getName());
        existing.setEmail(drEmail.getEmail());
        existing.setDepartment(drEmail.getDepartment());
        return drEmailRepository.save(existing);
    }

    public void deleteDrEmail(Long id) {
        drEmailRepository.deleteById(id);
    }
}
