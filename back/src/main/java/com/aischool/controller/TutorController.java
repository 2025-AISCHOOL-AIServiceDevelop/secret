package com.aischool.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aischool.dto.FeedbackRequestDto;
import com.aischool.dto.FeedbackResponseDto;
import com.aischool.service.TutorService;

@RestController
@RequestMapping("/api/tutor")
public class TutorController {
    
    private final TutorService tutorService;

    // 의존성주입
    public TutorController(TutorService tutorService){
        this.tutorService = tutorService;
    }

    // 발음 평가 요청 api
@PostMapping("/feedback")
    public FeedbackResponseDto createFeedback(@RequestBody FeedbackRequestDto requestDto) {
        return tutorService.createFeedback(requestDto);
    }
}
