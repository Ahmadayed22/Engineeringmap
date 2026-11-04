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
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.StudyPlanRepo;

/**
 * Roadmaps: listing, creating (hidden, from a copy or empty), renaming, reordering and
 * showing/hiding. Nothing is ever deleted; hiding keeps every comment, grade and plan.
 */
@Service
public class StudyPlanService {

    public static final String PLAN_NOT_FOUND = "Study plan not found";
    static final String DEFAULT_BANNER_COLOR = "#87032f";

    private final StudyPlanRepo planRepo;
    private final StudyMapService mapService;

    public StudyPlanService(StudyPlanRepo planRepo, StudyMapService mapService) {
        this.planRepo = planRepo;
        this.mapService = mapService;
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
        return new PlanInfo(p.getSlug(), p.getNameAr(), p.getNameEn(), p.isVisible(), p.getSortOrder());
    }
}
