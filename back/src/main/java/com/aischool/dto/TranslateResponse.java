package com.aischool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class TranslateResponse {
    private Integer contentsId;   // 번역본 contents_id
    private String projectId;
    private String exportId;
    private String savedPath;     // 로컬 저장 경로
}
