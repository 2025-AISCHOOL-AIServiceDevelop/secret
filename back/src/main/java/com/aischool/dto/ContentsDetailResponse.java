package com.aischool.dto;

import com.aischool.entity.Contents;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ContentsDetailResponse {
    Integer contentsId;
    Integer parentId;
    String title;
    String thumbUrl;
    String language;
    Integer durationSec;
    String contentsPath; // 재생에 쓰일 로컬/외부 경로
    String projectId;
    String exportId;

    public static ContentsDetailResponse from(Contents c) {
        return ContentsDetailResponse.builder()
                .contentsId(c.getContentsId())
                .parentId(c.getParentId())
                .title(c.getTitle())
                .thumbUrl(c.getThumbUrl())
                .language(c.getLanguage())
                .durationSec(c.getDurationSec())
                .contentsPath(c.getContentsPath())
                .projectId(c.getProjectId())
                .exportId(c.getExportId())
                .build();
    }
}