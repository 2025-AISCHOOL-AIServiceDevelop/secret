package com.aischool.service;

import com.aischool.dto.LearningHistoryRequest;
import com.aischool.dto.LearningHistoryResponse;
import com.aischool.entity.LearningHistory;
import com.aischool.repository.LearningHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningHistoryService {

    private final LearningHistoryRepository repo;

    // ★ 저장 or 업데이트
    @Transactional
    public void saveOrUpdate(Long userId, LearningHistoryRequest req) {
        LearningHistory history = repo.findByUserIdAndContentsId(userId, req.getContentsId())
                .orElseGet(() -> LearningHistory.builder()
                        .userId(userId)
                        .contentsId(req.getContentsId())
                        .build()
                );

        history.setProgressSec(req.getProgressSec());
        history.setTotalSec(req.getTotalSec());
        history.setLastLineIdx(req.getLastLineIdx());
        history.setUpdatedAt(LocalDateTime.now());

        repo.save(history);
    }

    // ★ 해당 사용자 기록 최신순 조회
    @Transactional(readOnly = true)
    public List<LearningHistoryResponse> getMyHistory(Long userId) {
        return repo.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(LearningHistoryResponse::from)
                .toList();
    }
}
