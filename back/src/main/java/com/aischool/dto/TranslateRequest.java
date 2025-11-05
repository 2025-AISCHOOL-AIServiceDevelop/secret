package com.aischool.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

/**
 * 클라이언트가 snake_case로 요청을 보내도 자동 매핑되도록 설정
 * 예시 요청:
 * {
 * "input_file_url": "https://example.com/video.mp4",
 * "source_language": "ko",
 * "target_language": "en"
 * }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TranslateRequest {

    /** 공개 접근 가능한 영상 URL (Google Drive는 직접 다운로드 URL 형태여야 함) */
    @JsonProperty("input_file_url")
    private String inputFileUrl;
    @JsonProperty("title")
    private String title;
    @JsonProperty("thumb_url")
    private String thumbUrl;
    @JsonProperty("source_language")
    private String sourceLang;
    @JsonProperty("target_language")
    private String targetLang;
    @JsonProperty("lipsync")
    private boolean lipsync = false;
    @JsonProperty("watermark")
    private boolean watermark = true;
    @JsonProperty("duration_sec")
    private Integer durationSec;
    @JsonProperty("number_of_speakers")
    private Integer numberOfSpeakers = 1;
}