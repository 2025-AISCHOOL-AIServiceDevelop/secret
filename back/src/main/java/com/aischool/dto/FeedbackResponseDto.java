package com.aischool.dto;

import java.time.LocalDateTime;

import com.aischool.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 백엔드 → 프론트로 보내는 응답 데이터
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDto {

    private Long feedbackId;
    private Long userId;
    private Long contentsId;
    private Long scriptId;
    private String scriptText;
    private String lang;

    private Integer finalScore;
    private Integer accuracy;
    private Integer fluency;
    private Integer completeness;

    private String medal;          // GOLD, SILVER, BRONZE
    private String feedbackText;   // AI 최종 피드백 문장 (세밀 + 톤 포함)
    private LocalDateTime feedbackDate;

    // 엔티티에서 DTO로 변환할 때 사용
    public static FeedbackResponseDto fromEntity(Feedback feedback) {
        return FeedbackResponseDto.builder()
                .feedbackId(feedback.getFeedbackId())
                .userId(feedback.getUserId())
                .contentsId(feedback.getContentsId())
                .scriptId(feedback.getScriptId())
                .lang(feedback.getLang())
                .finalScore(feedback.getFinalScore())
                .accuracy(feedback.getAccuracy())
                .fluency(feedback.getFluency())
                .completeness(feedback.getCompleteness())
                .medal(feedback.getMedal().name())
                .feedbackText(feedback.getFeedbackText())
                .feedbackDate(
                        feedback.getFeedbackDate() != null
                                ? feedback.getFeedbackDate()
                                : LocalDateTime.now())
                .build();
    }
}
