package com.aischool.dto;

import lombok.Data;

@Data
public class LearningHistoryRequest {
    private Long contentsId;
    private Integer progressSec;
    private Integer totalSec;
    private Integer lastLineIdx;
}
