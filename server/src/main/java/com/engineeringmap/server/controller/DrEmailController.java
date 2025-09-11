package com.engineeringmap.server.controller;

import com.engineeringmap.server.entity.DrEmail;
import com.engineeringmap.server.service.DrEmailService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/dremails")
public class DrEmailController {

    private final DrEmailService drEmailService;

    public DrEmailController(DrEmailService drEmailService) {
        this.drEmailService = drEmailService;
    }

    @GetMapping
    public ResponseEntity<Page<DrEmail>> getDrEmails(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<DrEmail> drEmails = drEmailService.getDrEmails(page, size, search, department, sortBy, sortDir);
        return ResponseEntity.ok(drEmails);
    }

    @PostMapping
    public ResponseEntity<DrEmail> createDrEmail(@RequestBody DrEmail drEmail) {
        return ResponseEntity.ok(drEmailService.createDrEmail(drEmail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DrEmail> updateDrEmail(@PathVariable Long id, @RequestBody DrEmail drEmail) {
        return ResponseEntity.ok(drEmailService.updateDrEmail(id, drEmail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrEmail(@PathVariable Long id) {
        drEmailService.deleteDrEmail(id);
        return ResponseEntity.noContent().build();
    }
}