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

    private Integer finalScore;      // 최종 점수
    private String medal;            // 메달 등급 (GOLD, SILVER, BRONZE)
    private String feedbackText;     // AI 피드백 문장
    private LocalDateTime feedbackDate; // 피드백 생성 시각

    // 엔티티에서 DTO로 변환할 때 사용
    public static FeedbackResponseDto fromEntity(Feedback feedback) {
        return FeedbackResponseDto.builder()
                .finalScore(feedback.getFinalScore())
                .medal(feedback.getMedal().name())
                .feedbackText(feedback.getFeedbackText())
                .feedbackDate(feedback.getFeedbackDate() != null ? feedback.getFeedbackDate() : LocalDateTime.now())
                .build();
    }
}
