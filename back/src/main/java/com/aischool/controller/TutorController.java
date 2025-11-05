package com.aischool.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aischool.dto.FeedbackRequestDto;
import com.aischool.dto.FeedbackResponseDto;
import com.aischool.service.TutorService;

import lombok.RequiredArgsConstructor;

    @RestController
    @RequiredArgsConstructor                                                   
    @RequestMapping("/api/tutor")
    public class TutorController {
    
    private final TutorService tutorService;


    // 발음 평가 요청 api
    @PostMapping("/feedback")
    public FeedbackResponseDto createFeedback(@RequestBody FeedbackRequestDto requestDto) {
        return tutorService.createFeedback(requestDto);
    }

    // 분석 api (파일 업로드용)
    @PostMapping("/analyze")
    public FeedbackResponseDto analyzePronunication(
        @RequestParam("file") MultipartFile audioFile,
        @RequestParam("userId") Long userId,
        @RequestParam("contentsId") Long contentsId,
        @RequestParam("lang") String lang,
        @RequestParam("targetSentence") String targetSentence)
    {
        // 파일 전송 + ai 분석 + DB 저장 + 결과 반환
        return tutorService.processPronunciationFeedback(audioFile, userId, contentsId, lang, targetSentence);

    }
    
}
