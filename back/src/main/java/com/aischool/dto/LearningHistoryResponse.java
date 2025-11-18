package com.aischool.dto;

import com.aischool.entity.LearningHistory;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LearningHistoryResponse {

    private Long id;
    private Long contentsId;
    private Integer progressSec;
    private Integer totalSec;
    private Integer lastLineIdx;
    private LocalDateTime updatedAt;

    public static LearningHistoryResponse from(LearningHistory h) {
        LearningHistoryResponse dto = new LearningHistoryResponse();

        dto.setId(h.getId());
        dto.setContentsId(h.getContentsId());
        dto.setProgressSec(h.getProgressSec());
        dto.setTotalSec(h.getTotalSec());
        dto.setLastLineIdx(h.getLastLineIdx());
        dto.setUpdatedAt(h.getUpdatedAt());

        return dto;
    }
}
