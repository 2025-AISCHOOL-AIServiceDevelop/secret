package com.aischool.service;

import com.aischool.dto.ContentsDetailResponse;
import com.aischool.dto.ContentsGroupResponse;
import com.aischool.entity.Contents;
import com.aischool.repository.ContentsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentsService {

    private final ContentsRepository contentsRepository;

    @Transactional(readOnly = true)
    public List<ContentsGroupResponse> searchGrouped(String query) {
        List<Contents> matched = contentsRepository.searchIgnoringSpaces(query);
        if (matched.isEmpty()) {
            return List.of();
        }

        Map<Integer, Contents> originalsById = new HashMap<>();
        Set<Integer> orderedOriginalIds = new LinkedHashSet<>();
        Set<Integer> missingParentIds = new LinkedHashSet<>();

        for (Contents contents : matched) {
            Integer parentId = contents.getParentId();
            if (parentId == null) {
                Integer originalId = contents.getContentsId();
                if (originalId != null) {
                    orderedOriginalIds.add(originalId);
                    originalsById.putIfAbsent(originalId, contents);
                }
                continue;
            }

            orderedOriginalIds.add(parentId);
            if (!originalsById.containsKey(parentId)) {
                missingParentIds.add(parentId);
            }
        }

        if (!missingParentIds.isEmpty()) {
            contentsRepository.findByContentsIdIn(missingParentIds)
                    .forEach(parent -> originalsById.put(parent.getContentsId(), parent));
        }

        if (orderedOriginalIds.isEmpty()) {
            orderedOriginalIds.addAll(originalsById.keySet());
        }

        Map<Integer, List<Contents>> translationsByParent = new HashMap<>();
        if (!originalsById.isEmpty()) {
            List<Contents> translations = loadTranslations(originalsById.keySet());
            for (Contents translation : translations) {
                Integer parentId = translation.getParentId();
                if (parentId == null || !originalsById.containsKey(parentId)) {
                    continue;
                }
                translationsByParent
                        .computeIfAbsent(parentId, ignored -> new ArrayList<>())
                        .add(translation);
            }
        }

        List<ContentsGroupResponse> groupedResponses = new ArrayList<>();
        for (Integer originalId : orderedOriginalIds) {
            Contents original = originalsById.get(originalId);
            if (original == null) {
                continue;
            }

            List<ContentsDetailResponse> translationDtos = translationsByParent
                    .getOrDefault(originalId, Collections.emptyList())
                    .stream()
                    .map(ContentsDetailResponse::from)
                    .collect(Collectors.toList());

            groupedResponses.add(
                    ContentsGroupResponse.builder()
                            .original(ContentsDetailResponse.from(original))
                            .translations(translationDtos)
                            .build()
            );
        }

        return groupedResponses;
    }

    private List<Contents> loadTranslations(Set<Integer> parentIds) {
        if (parentIds.isEmpty()) {
            return List.of();
        }

        if (parentIds.size() == 1) {
            Integer parentId = parentIds.iterator().next();
            return contentsRepository.findByParentId(parentId);
        }

        return contentsRepository.findByParentIdIn(parentIds);
    }
}
