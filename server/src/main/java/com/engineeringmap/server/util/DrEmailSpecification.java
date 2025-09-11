package com.engineeringmap.server.util;

import com.engineeringmap.server.entity.DrEmail;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;

public class DrEmailSpecification {

    public static Specification<DrEmail> filter(String search, String department) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (search != null && !search.isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchLower);
                Predicate emailPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchLower);
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(namePredicate, emailPredicate));
            }

            if (department != null && !department.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("department"), department));
            }

            return predicate;
        };
    }
}