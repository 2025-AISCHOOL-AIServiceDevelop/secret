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
    private String feedbackText;

    
}
