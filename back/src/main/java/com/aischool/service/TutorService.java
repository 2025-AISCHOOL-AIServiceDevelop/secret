package com.aischool.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.aischool.dto.FeedbackRequestDto;
import com.aischool.dto.FeedbackResponseDto;

// 발음 분석 / 점수 계산 / 피드백 문장 생성 담당 서비스

@Service
public class TutorService {

    public FeedbackResponseDto createFeedback(FeedbackRequestDto requestDto){

         // 1) 로그처럼 확인할 수 있는 값들 (나중에 디버깅 도움됨)
        Long userId = requestDto.getUserId();
        String targetSentence = requestDto.getTargetSentence();
        String filePath = requestDto.getRecordedFilePath();

        // (지금은 이 값들을 그냥 쓰진 않지만,
        // 일단 꺼내두는 것만으로도 "내 요청이 제대로 들어왔나"를 확인 가능)

        int fakeScore = 90; // 임시 점수
        String fakeMedal = "GOLD";
        String fakeFeedbackText = "발음이 점점 또렷해지고 있어요! 지금처럼 자신 있게 말해볼까요?";

        return new FeedbackResponseDto(
                fakeScore,
                fakeMedal,
                fakeFeedbackText,
                LocalDateTime.now()
        );
    }
    
}
