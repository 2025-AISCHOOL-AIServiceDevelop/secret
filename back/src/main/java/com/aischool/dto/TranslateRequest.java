package com.aischool.dto;

import lombok.Data;

@Data
public class TranslateRequest {
    // 공개 접근 가능한 영상 URL (Google Drive는 '직접 다운로드 URL' 형태여야 함)
    private String inputFileUrl;

    // 메타(원본 콘텐츠)
    private String title;
    private String thumbUrl;

    // 언어
    private String sourceLang; // 예: ko
    private String targetLang; // 예: en

    // 옵션
    private boolean lipsync = false;
    private boolean watermark = true;

    // (선택) 영상 길이/화자수 – Perso쪽이 요구하면 채워줌
    private Integer durationSec;          // 모를 경우 null
    private Integer numberOfSpeakers = 1; // 기본 1
}
