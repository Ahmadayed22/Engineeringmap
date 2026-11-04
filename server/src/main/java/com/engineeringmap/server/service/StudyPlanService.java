package com.engineeringmap.server.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.StudyMapDto.MapContent;
import com.engineeringmap.server.dto.StudyMapDto.MapNode;
import com.engineeringmap.server.dto.StudyPlanDto.CreateRequest;
import com.engineeringmap.server.dto.StudyPlanDto.PlanInfo;
import com.engineeringmap.server.dto.StudyPlanDto.UpdateRequest;
import com.engineeringmap.server.entity.StudyPlan;
import com.engineeringmap.server.entity.StudyPlanImage;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.PlannedCourseRepo;
import com.engineeringmap.server.repo.StudyMapRepo;
import com.engineeringmap.server.repo.StudyPlanImageRepo;
import com.engineeringmap.server.repo.StudyPlanRepo;

/**
 * Roadmaps: listing, creating (hidden, from a copy or empty), renaming, reordering,
 * showing/hiding, card pictures and removal. Removing a roadmap deletes its map history and
 * the planner entries made on it; courses and their comments, materials, grades and ratings
 * stay, because they belong to courses (which other roadmaps may use).
 */
@Service
public class StudyPlanService {

    public static final String PLAN_NOT_FOUND = "Study plan not found";
    public static final String LAST_PLAN = "You can't remove the last roadmap";
    public static final String BAD_IMAGE = "Upload a JPG, PNG or WebP image";
    public static final String IMAGE_TOO_LARGE = "The image is too large (2 MB at most)";
    public static final String NO_IMAGE = "This roadmap has no picture";
    static final int MAX_IMAGE_BYTES = 2 * 1024 * 1024;
    static final String DEFAULT_BANNER_COLOR = "#87032f";

    private final StudyPlanRepo planRepo;
    private final StudyMapService mapService;
    private final StudyMapRepo mapRepo;
    private final PlannedCourseRepo plannedRepo;
    private final StudyPlanImageRepo imageRepo;

    public StudyPlanService(StudyPlanRepo planRepo, StudyMapService mapService, StudyMapRepo mapRepo,
            PlannedCourseRepo plannedRepo, StudyPlanImageRepo imageRepo) {
        this.planRepo = planRepo;
        this.mapService = mapService;
        this.mapRepo = mapRepo;
        this.plannedRepo = plannedRepo;
        this.imageRepo = imageRepo;
    }

    /** Visible roadmaps; admins also get the hidden ones. */
    @Transactional(readOnly = true)
    public List<PlanInfo> list(boolean admin) {
        return (admin ? planRepo.findAllByOrderBySortOrderAscIdAsc()
                : planRepo.findByVisibleTrueOrderBySortOrderAscIdAsc())
                .stream().map(StudyPlanService::toInfo).toList();
    }

    /** Throws 404 unless the roadmap exists and the caller may see it (hidden = admins only). */
    @Transactional(readOnly = true)
    public void requireReadable(String slug, boolean admin) {
        StudyPlan plan = planRepo.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));
        if (!plan.isVisible() && !admin) {
            throw new ResourceNotFoundException(PLAN_NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public void requireExists(String slug) {
        if (!planRepo.existsBySlug(slug)) {
            throw new ResourceNotFoundException(PLAN_NOT_FOUND);
        }
    }

    @Transactional
    public PlanInfo create(CreateRequest request, Long adminId) {
        String nameAr = request.nameAr().strip();
        String nameEn = request.nameEn().strip();

        MapContent content;
        if (request.copyFrom() != null && !request.copyFrom().isBlank()) {
            requireExists(request.copyFrom());
            MapContent source = mapService.current(request.copyFrom()).content();
            // Same courses and arrows; the title banner gets the new roadmap's name.
            content = new MapContent(source.nodes().stream()
                    .map(n -> n.banner()
                            ? new MapNode(n.id(), null, nameAr, n.x(), n.y(), n.color(), true)
                            : n)
                    .toList(), source.edges());
        } else {
            content = new MapContent(
                    List.of(new MapNode("root", null, nameAr, 0, 0, DEFAULT_BANNER_COLOR, true)), List.of());
        }

        StudyPlan plan = new StudyPlan();
        plan.setSlug(uniqueSlug(nameEn));
        plan.setNameAr(nameAr);
        plan.setNameEn(nameEn);
        plan.setVisible(false);
        plan.setSortOrder(planRepo.maxSortOrder() + 1);
        planRepo.saveAndFlush(plan);

        mapService.publish(plan.getSlug(), 0, content, adminId);
        return toInfo(plan);
    }

    @Transactional
    public PlanInfo update(String slug, UpdateRequest request) {
        StudyPlan plan = planRepo.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));
        if (request.nameAr() != null) {
            plan.setNameAr(requireText(request.nameAr()));
        }
        if (request.nameEn() != null) {
            plan.setNameEn(requireText(request.nameEn()));
        }
        if (request.visible() != null) {
            plan.setVisible(request.visible());
        }
        if (request.sortOrder() != null) {
            plan.setSortOrder(request.sortOrder());
        }
        return toInfo(planRepo.save(plan));
    }

    /** Removes a roadmap with its map history, card picture and planner entries. */
    @Transactional
    public void delete(String slug) {
        StudyPlan plan = find(slug);
        if (planRepo.count() <= 1) {
            throw new IllegalArgumentException(LAST_PLAN);
        }
        plannedRepo.deleteByPlan(slug);
        mapRepo.deleteByPlan(slug);
        imageRepo.findById(slug).ifPresent(imageRepo::delete);
        planRepo.delete(plan);
    }

    /** Sets the card picture. The content decides the type, never the file name or header. */
    @Transactional
    public PlanInfo setImage(String slug, byte[] data) {
        StudyPlan plan = find(slug);
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException(BAD_IMAGE);
        }
        if (data.length > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException(IMAGE_TOO_LARGE);
        }
        String type = imageType(data);
        if (type == null) {
            throw new IllegalArgumentException(BAD_IMAGE);
        }
        imageRepo.save(new StudyPlanImage(slug, type, data));
        plan.setImageVersion(System.currentTimeMillis());
        return toInfo(planRepo.save(plan));
    }

    @Transactional
    public PlanInfo removeImage(String slug) {
        StudyPlan plan = find(slug);
        imageRepo.findById(slug).ifPresent(imageRepo::delete);
        plan.setImageVersion(null);
        return toInfo(planRepo.save(plan));
    }

    @Transactional(readOnly = true)
    public StudyPlanImage image(String slug) {
        return imageRepo.findById(slug).orElseThrow(() -> new ResourceNotFoundException(NO_IMAGE));
    }

    /** JPEG, PNG or WebP by their first bytes; anything else (SVG, HTML, ...) is refused. */
    static String imageType(byte[] d) {
        if (d.length >= 3 && (d[0] & 0xFF) == 0xFF && (d[1] & 0xFF) == 0xD8 && (d[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (d.length >= 8 && (d[0] & 0xFF) == 0x89 && d[1] == 'P' && d[2] == 'N' && d[3] == 'G'
                && d[4] == 0x0D && d[5] == 0x0A && d[6] == 0x1A && d[7] == 0x0A) {
            return "image/png";
        }
        if (d.length >= 12 && d[0] == 'R' && d[1] == 'I' && d[2] == 'F' && d[3] == 'F'
                && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P') {
            return "image/webp";
        }
        return null;
    }

    private StudyPlan find(String slug) {
        return planRepo.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));
    }

    private static String requireText(String value) {
        String v = value.strip();
        if (v.isEmpty()) {
            throw new IllegalArgumentException("Roadmap name can't be empty");
        }
        return v;
    }

    /** "Computer Engineering 2026" → "computer-engineering-2026", made unique with -2, -3... */
    String uniqueSlug(String nameEn) {
        String base = slugify(nameEn);
        String slug = base;
        for (int i = 2; planRepo.existsBySlug(slug); i++) {
            slug = base + "-" + i;
        }
        return slug;
    }

    static String slugify(String text) {
        String ascii = Normalizer.normalize(text, Normalizer.Form.NFKD).replaceAll("\\p{M}", "");
        String slug = ascii.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (slug.length() > 34) {
            slug = slug.substring(0, 34).replaceAll("-+$", "");
        }
        return slug.isEmpty() ? "plan" : slug;
    }

    private static PlanInfo toInfo(StudyPlan p) {
        return new PlanInfo(p.getSlug(), p.getNameAr(), p.getNameEn(), p.isVisible(), p.getSortOrder(),
                p.getImageVersion());
    }
}
