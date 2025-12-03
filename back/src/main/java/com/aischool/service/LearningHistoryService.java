package com.aischool.service;

import com.aischool.dto.LearningHistoryRequest;
import com.aischool.dto.LearningHistoryResponse;
import com.aischool.entity.LearningHistory;
import com.aischool.repository.LearningHistoryRepository;
import com.aischool.repository.LearningHistoryWithContentsProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningHistoryService {

    private final LearningHistoryRepository repo;

    // ★ 저장 or 업데이트 (언어 기준까지 포함)
    @Transactional
    public void saveOrUpdate(Long userId, LearningHistoryRequest req) {

        // 프론트에서 넘겨주는 언어 코드("en", "ko", "ja"...)
        String language = req.getLanguage();

        LearningHistory history = repo
                .findByUserIdAndContentsIdAndLanguage(
                        userId,
                        req.getContentsId(),
                        language
                )
                .orElseGet(() -> LearningHistory.builder()
                        .userId(userId)
                        .contentsId(req.getContentsId())
                        .language(language)      // ★ 새 레코드일 때 언어 저장
                        .build()
                );

        // 기록 업데이트
        history.setProgressSec(req.getProgressSec());
        history.setTotalSec(req.getTotalSec());
        history.setLastLineIdx(req.getLastLineIdx());
        history.setUpdatedAt(LocalDateTime.now());

        repo.save(history);
    }

    // ★ 해당 사용자 + 언어별 기록 조회 (콘텐츠 정보 JOIN)
    @Transactional(readOnly = true)
    public List<LearningHistoryResponse> getMyHistory(Long userId, String language) {

        // LearningHistory + Contents JOIN 결과 가져오기 (언어 필터)
        List<LearningHistoryWithContentsProjection> rows =
                repo.findDetailedByUserIdAndLanguageOrderByUpdatedAtDesc(userId, language);

        // Projection → DTO 매핑
        return rows.stream()
                .map(p -> {
                    LearningHistoryResponse dto = new LearningHistoryResponse();

                    // 학습 기록 정보
                    dto.setId(p.getId());
                    dto.setContentsId(p.getContentsId());
                    dto.setProgressSec(p.getProgressSec());
                    dto.setTotalSec(p.getTotalSec());
                    dto.setLastLineIdx(p.getLastLineIdx());
                    dto.setUpdatedAt(p.getUpdatedAt());

                    // 콘텐츠 정보
                    dto.setTitle(p.getTitle());
                    dto.setThumbUrl(p.getThumbUrl());
                    dto.setContentsPath(p.getContentsPath());
                    dto.setDurationSec(p.getDurationSec());
                    dto.setLanguage(p.getLanguage());

                    return dto;
                })
                .toList();
    }
}
