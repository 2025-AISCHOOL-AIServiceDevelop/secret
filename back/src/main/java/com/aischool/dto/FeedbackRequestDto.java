package com.aischool.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequestDto {

    
    private Long userId; // 누가 말했는지 (나중에 마이페이지에서 보기 위해 필요)

    private Long contentsId; 

    private Long scriptId; 

    private String lang;

    private String targetSentence;// 아이가 따라 읽어야 했던 정답 문장

    // 아이가 실제로 말한 음성 파일(서버에 저장된 경로 or 파일명)
    private String recordedFilePath;

    private String audioFileUrl; // Azure로 분석 보낼 파일 URL


}
