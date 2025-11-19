package com.aischool.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedFeedbackResult {
    private int finalScore;
    private int accuracy;
    private int fluency;
    private int completeness;
    private String medal;
    private String feedbackText;   // 세밀 + 응원 문장까지 합쳐진 최종 피드백
}
