package com.aischool.dto;

import java.time.LocalDateTime;

public class FeedbackResponseDto {

    // 서버가 프론트에게 돌려주는 발음 평가 결과 

    private int score; 
    private String medal;
    private String feedbackText;
    private LocalDateTime evaluatedAt;

    public FeedbackResponseDto(int score, String medal, String feedbackText, LocalDateTime evaluateAt){
        this.score = score;
        this.medal = medal;
        this.feedbackText = feedbackText;
        this.evaluatedAt = evaluateAt;
    }

    public int getScore(){
        return score;
    }

    public String getMedal(){
        return medal;
    }

    public String getFeedbackText(){
        return feedbackText;
    }

    public LocalDateTime getEvalatedAt(){
        return evaluatedAt;
    }
}
