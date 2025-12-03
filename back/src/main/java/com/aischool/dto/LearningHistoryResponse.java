package com.aischool.dto;

import com.aischool.entity.Contents;
import com.aischool.entity.LearningHistory;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LearningHistoryResponse {

    // 학습 기록 정보
    private Long id;
    private Long contentsId;
    private Integer progressSec;
    private Integer totalSec;
    private Integer lastLineIdx;
    private LocalDateTime updatedAt;

    // 콘텐츠 정보
    private String title;
    private String thumbUrl;
    private String contentsPath;
    private Integer durationSec;
    private String language;

    // 학습 기록 + 콘텐츠 JOIN 데이터 매핑
    public static LearningHistoryResponse from(LearningHistory h, Contents c) {
        LearningHistoryResponse dto = new LearningHistoryResponse();

        // LearningHistory 정보
        dto.setId(h.getId());
        dto.setContentsId(h.getContentsId());
        dto.setProgressSec(h.getProgressSec());
        dto.setTotalSec(h.getTotalSec());
        dto.setLastLineIdx(h.getLastLineIdx());
        dto.setUpdatedAt(h.getUpdatedAt());

        // Contents 정보
        dto.setTitle(c.getTitle());
        dto.setThumbUrl(c.getThumbUrl());
        dto.setContentsPath(c.getContentsPath());
        dto.setDurationSec(c.getDurationSec());
        dto.setLanguage(c.getLanguage());

        return dto;
    }
}
