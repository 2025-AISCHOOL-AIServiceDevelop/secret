package com.aischool.dto;


public class FeedbackRequestDto {

    // 누가 말했는지 (나중에 마이페이지에서 보기 위해 필요)
    private Long userId;

    // 아이가 따라 읽어야 했던 정답 문장
    private String targetSentence;

    // 아이가 실제로 말한 음성 파일(서버에 저장된 경로 or 파일명)
    private String recordedFilePath;

    public FeedbackRequestDto() {
        // 기본 생성자 (스프링이 JSON 바인딩할 때 필요)
    }

    public Long getUserId() {
        return userId;
    }

    public String getTargetSentence() {
        return targetSentence;
    }

    public String getRecordedFilePath() {
        return recordedFilePath;
    }

    // setter까지 만들어줘야 @RequestBody로 JSON을 객체에 넣을 수 있음
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setTargetSentence(String targetSentence) {
        this.targetSentence = targetSentence;
    }

    public void setRecordedFilePath(String recordedFilePath) {
        this.recordedFilePath = recordedFilePath;
    }
}
