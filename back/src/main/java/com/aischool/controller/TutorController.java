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
import com.aischool.service.FeedbackGenerator;   
import com.aischool.service.GeneratedFeedbackResult; 

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;


    @RestController
    @RequiredArgsConstructor                                                   
    @RequestMapping("/api/tutor")
    public class TutorController {
    
    private final TutorService tutorService;
    private final FeedbackGenerator feedbackGenerator;


    // 발음 평가 요청 api
    @PostMapping("/feedback")
    public FeedbackResponseDto createFeedback(@RequestBody FeedbackRequestDto requestDto) {
        return tutorService.createFeedback(requestDto);
    }

    // 분석 api (파일 업로드용)
     @PostMapping("/analyze")
    public FeedbackResponseDto analyzePronunciation(@RequestParam("file") MultipartFile file,
                                                    @RequestParam("userId") Long userId,
                                                    @RequestParam("contentsId") Long contentsId,
                                                    @RequestParam("scriptId") Long scriptId,
                                                    @RequestParam("lang") String lang) {
        return tutorService.processPronunciationFeedback(file, userId, contentsId, scriptId, lang);
    }

    // 가장 최근 피드백 조회 API
    @GetMapping("/feedback/latest")
    public FeedbackResponseDto getLatestFeedback(@RequestParam Long userId,
                                                @RequestParam Long contentsId,
                                                @RequestParam Long scriptId) {
        return tutorService.getLatestFeedback(userId, contentsId, scriptId);
    }

    @PostMapping("/feedback-test")
    public GeneratedFeedbackResult testFeedback(@RequestBody String azureJson) {
        return feedbackGenerator.generate(azureJson);
    }
    
    
}
