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
}
