package com.aischool.service;

import org.springframework.stereotype.Component;

// 분석 결과 받아서 쓰기 편한 상태로 가공

@Component
public class FeedbackGenerator {

    public GeneratedFeedbackResult generate(Object aiResult) {
    
    int finalScore = 92;
    int accuracy = 95;
    int fluency = 90;
    int completeness = 93;
    String medal = "GOLD";
    String feedbackText = "발음이 또렷해요! 지금처럼 자신있게 말해봐요!";

    return new GeneratedFeedbackResult(
        finalScore,
        accuracy,
        fluency,
        completeness,
        medal,
        feedbackText
    );

    }

    // ✅ 2️⃣ 새로 추가: 점수 기반 간단한 피드백 문장 생성 메서드
    public String generateSimpleFeedback(double finalScore, double accuracy, double fluency, double completeness) {
        StringBuilder feedback = new StringBuilder();

        // 🔹 종합 점수 기준 피드백
        if (finalScore >= 85) {
            feedback.append("아주 잘했어요! ");
        } else if (finalScore >= 70) {
            feedback.append("좋아요! 조금만 더 연습해볼까요? ");
        } else {
            feedback.append("조금 더 또박또박 발음해보면 좋겠어요! ");
        }

        // 🔹 세부 점수 기준 피드백
        if (accuracy >= 85) {
            feedback.append("정확도가 높아요! ");
        } else {
            feedback.append("단어 발음을 조금 더 정확히 해봐요. ");
        }

        if (fluency >= 80) {
            feedback.append("발음이 자연스럽네요! ");
        } else {
            feedback.append("조금 더 천천히 말하면 좋아요. ");
        }

        if (completeness >= 80) {
            feedback.append("전체적으로 완성도가 좋아요!");
        } else {
            feedback.append("끝까지 문장을 마무리해보세요!");
        }

        return feedback.toString();
    }

}
