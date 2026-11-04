package com.engineeringmap.server.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.StudyMapDto.MapContent;
import com.engineeringmap.server.dto.StudyMapDto.MapEdge;
import com.engineeringmap.server.dto.StudyMapDto.MapNode;
import com.engineeringmap.server.dto.StudyMapDto.MapResponse;
import com.engineeringmap.server.dto.StudyMapDto.VersionInfo;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.StudyMap;
import com.engineeringmap.server.exception.ConflictException;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.StudyMapRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Reads and publishes the study-plan maps. Removing a course from a map only removes its box:
 * the course row and everything attached to it (comments, materials, grades) stay.
 */
@Service
public class StudyMapService {

    public static final String STALE_VERSION = "The map was changed by someone else. Reload it and try again.";
    public static final String MAP_NOT_FOUND = "Study map not found";

    private final StudyMapRepo mapRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final ObjectMapper json;

    public StudyMapService(StudyMapRepo mapRepo, CourseRepo courseRepo, UserRepo userRepo, ObjectMapper json) {
        this.mapRepo = mapRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.json = json;
    }

    @Transactional(readOnly = true)
    public MapResponse current(String plan) {
        return toResponse(mapRepo.findTopByPlanOrderByVersionDesc(plan)
                .orElseThrow(() -> new ResourceNotFoundException(MAP_NOT_FOUND)));
    }

    @Transactional(readOnly = true)
    public List<VersionInfo> versions(String plan) {
        return mapRepo.versions(plan);
    }

    @Transactional
    public MapResponse publish(String plan, int baseVersion, MapContent content, Long adminId) {
        int current = mapRepo.findTopByPlanOrderByVersionDesc(plan).map(StudyMap::getVersion).orElse(0);
        if (current != baseVersion) {
            throw new ConflictException(STALE_VERSION);
        }
        validate(content);

        StudyMap map = new StudyMap();
        map.setPlan(plan);
        map.setVersion(current + 1);
        map.setContent(write(normalize(content)));
        map.setCreatedBy(userRepo.getReferenceById(adminId));
        try {
            return toResponse(mapRepo.saveAndFlush(map));
        } catch (DataIntegrityViolationException e) {
            // Another admin published the same version a moment earlier.
            throw new ConflictException(STALE_VERSION);
        }
    }

    /** Publishes an old version again as the newest one (history is never rewritten). */
    @Transactional
    public MapResponse restore(String plan, int version, Long adminId) {
        StudyMap old = mapRepo.findByPlanAndVersion(plan, version)
                .orElseThrow(() -> new ResourceNotFoundException(MAP_NOT_FOUND));
        int current = mapRepo.findTopByPlanOrderByVersionDesc(plan).map(StudyMap::getVersion).orElse(0);
        return publish(plan, current, read(old.getContent()), adminId);
    }

    /**
     * Rules every published map must follow. Messages are shown to the admin as they are.
     * Package-private for tests.
     */
    void validate(MapContent content) {
        List<MapNode> nodes = content.nodes();
        List<MapEdge> edges = content.edges();

        Map<String, MapNode> byId = new HashMap<>();
        int roots = 0;
        for (MapNode n : nodes) {
            if (byId.put(n.id(), n) != null) {
                throw new IllegalArgumentException("Two boxes on the map have the same id: " + n.id());
            }
            if (!Double.isFinite(n.x()) || !Double.isFinite(n.y())
                    || Math.abs(n.x()) > 100_000 || Math.abs(n.y()) > 100_000) {
                throw new IllegalArgumentException("Box is placed too far away: " + n.label());
            }
            if (n.banner()) {
                roots++;
                if (n.courseId() != null) {
                    throw new IllegalArgumentException("The title banner can't be a course");
                }
            } else if (n.courseId() == null) {
                throw new IllegalArgumentException("Box has no course: " + n.label());
            }
        }
        if (roots != 1) {
            throw new IllegalArgumentException("The map needs exactly one title banner");
        }

        Set<Long> courseIds = nodes.stream().map(MapNode::courseId).filter(id -> id != null)
                .collect(Collectors.toSet());
        Set<Long> known = courseRepo.findAllById(courseIds).stream().map(Course::getId)
                .collect(Collectors.toSet());
        List<Long> unknown = courseIds.stream().filter(id -> !known.contains(id)).sorted().toList();
        if (!unknown.isEmpty()) {
            throw new IllegalArgumentException("Unknown course id: " + unknown);
        }

        Set<String> edgeIds = new HashSet<>();
        Set<String> pairs = new HashSet<>();
        Map<String, List<String>> out = new HashMap<>();
        for (MapEdge e : edges) {
            if (!edgeIds.add(e.id())) {
                throw new IllegalArgumentException("Two arrows on the map have the same id: " + e.id());
            }
            MapNode from = byId.get(e.source());
            MapNode to = byId.get(e.target());
            if (from == null || to == null) {
                throw new IllegalArgumentException("Arrow points to a box that doesn't exist: " + e.id());
            }
            if (e.source().equals(e.target())) {
                throw new IllegalArgumentException("A course can't require itself: " + from.label());
            }
            if (to.banner()) {
                throw new IllegalArgumentException("Nothing can point to the title banner");
            }
            if (!pairs.add(e.source() + "\u0000" + e.target())) {
                throw new IllegalArgumentException(
                        "The same arrow is drawn twice: " + from.label() + " → " + to.label());
            }
            out.computeIfAbsent(e.source(), k -> new ArrayList<>()).add(e.target());
        }

        List<String> cycle = findCycle(byId.keySet(), out);
        if (cycle != null) {
            throw new IllegalArgumentException("Prerequisites go in a circle: "
                    + cycle.stream().map(id -> byId.get(id).label().strip()).collect(Collectors.joining(" → ")));
        }
    }

    /** Returns the node ids of one cycle (first id repeated at the end), or null. */
    private static List<String> findCycle(Set<String> ids, Map<String, List<String>> out) {
        Map<String, Integer> state = new HashMap<>(); // 1 = on the current path, 2 = done
        for (String start : ids) {
            if (state.containsKey(start)) continue;
            // Iterative DFS so a long chain can't overflow the stack.
            List<String> path = new ArrayList<>();
            List<Integer> nextChild = new ArrayList<>();
            path.add(start);
            nextChild.add(0);
            state.put(start, 1);
            while (!path.isEmpty()) {
                int top = path.size() - 1;
                String node = path.get(top);
                List<String> children = out.getOrDefault(node, List.of());
                int i = nextChild.get(top);
                if (i < children.size()) {
                    nextChild.set(top, i + 1);
                    String child = children.get(i);
                    Integer s = state.get(child);
                    if (s == null) {
                        state.put(child, 1);
                        path.add(child);
                        nextChild.add(0);
                    } else if (s == 1) {
                        List<String> cycle = new ArrayList<>(path.subList(path.indexOf(child), path.size()));
                        cycle.add(child);
                        return cycle;
                    }
                } else {
                    state.put(node, 2);
                    path.remove(top);
                    nextChild.remove(top);
                }
            }
        }
        return null;
    }

    /** Trims labels and drops "false" flags so stored documents stay small and uniform. */
    private static MapContent normalize(MapContent c) {
        List<MapNode> nodes = c.nodes().stream()
                .map(n -> new MapNode(n.id(), n.banner() ? null : n.courseId(), n.label().strip(),
                        Math.round(n.x() * 10) / 10.0, Math.round(n.y() * 10) / 10.0,
                        n.color().toLowerCase(), n.banner() ? true : null))
                .toList();
        List<MapEdge> edges = c.edges().stream()
                .map(e -> new MapEdge(e.id(), e.source(), e.target(), e.color().toLowerCase(),
                        Boolean.TRUE.equals(e.coreq()) ? true : null))
                .toList();
        return new MapContent(nodes, edges);
    }

    private MapResponse toResponse(StudyMap m) {
        String author = m.getCreatedBy() == null ? null : m.getCreatedBy().getUsername();
        return new MapResponse(m.getPlan(), m.getVersion(), m.getCreatedAt(), author, read(m.getContent()));
    }

    private MapContent read(String content) {
        try {
            return json.readValue(content, MapContent.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Stored study map is not valid JSON", e);
        }
    }

    private String write(MapContent content) {
        try {
            return json.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
