package com.aischool.client;

import org.springframework.stereotype.Component;

// 실제로는 Azure Sdk를 호출해서 발음 분석결과를 받아오는 역할

@Component
public class AzureSpeechClient {
    
    // analyzeAudio()는 TutorService에서 부르고 있음
    public String analyzeAudio(String audioFileUrl, String lang) {
        System.out.println("🎧 AzureSpeechClient.analyzeAudio() 호출됨!");
        System.out.println("파일 URL: " + audioFileUrl + ", 언어: " + lang);
        return "DUMMY_ANALYSIS_RESULT"; // 단순 문자열로 테스트용 리턴
    }
}
