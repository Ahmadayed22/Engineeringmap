package com.engineeringmap.server.service;


import com.engineeringmap.server.entity.DrEmail;
import com.engineeringmap.server.repo.DrEmailRepo;
import com.engineeringmap.server.util.DrEmailSpecification;

import org.springframework.data.domain.Page;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class DrEmailService {

    private final DrEmailRepo drEmailRepository;

    public DrEmailService(DrEmailRepo drEmailRepository) {
        this.drEmailRepository = drEmailRepository;
    }

    public Page<DrEmail> getDrEmails(int page, int size, String search, String department, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortBy != null ? sortBy : "id");
        if ("desc".equalsIgnoreCase(sortDir)) {
            sort = sort.descending();
        } else {
            sort = sort.ascending();
        }
        Pageable pageable = PageRequest.of(page, size, sort);
        return drEmailRepository.findAll(DrEmailSpecification.filter(search, department), pageable);
    }

    // Additional methods for CRUD if needed
    public DrEmail createDrEmail(DrEmail drEmail) {
        return drEmailRepository.save(drEmail);
    }

    public DrEmail updateDrEmail(Long id, DrEmail drEmail) {
        DrEmail existing = drEmailRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        existing.setName(drEmail.getName());
        existing.setEmail(drEmail.getEmail());
        existing.setDepartment(drEmail.getDepartment());
        return drEmailRepository.save(existing);
    }

    public void deleteDrEmail(Long id) {
        drEmailRepository.deleteById(id);
    }
}