package com.aischool.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aischool.client.AzureSpeechClient;
import com.aischool.dto.FeedbackRequestDto;
import com.aischool.dto.FeedbackResponseDto;
import com.aischool.entity.Feedback;

import lombok.RequiredArgsConstructor;

// 발음 분석 / 점수 계산 / 피드백 문장 생성 담당 서비스

@Service
@RequiredArgsConstructor
public class TutorService {

    private final AzureSpeechClient azureSpeechClient;
    private final FeedbackGenerator feedbackGenerator;
    private final FeedbackService feedbackService;

    public FeedbackResponseDto createFeedback(FeedbackRequestDto requestDto){

         // 기본정보 확인 
        Long userId = requestDto.getUserId();
        String targetSentence = requestDto.getTargetSentence();
        String filePath = requestDto.getRecordedFilePath();


        // azure api에 음성 파일 전송 + 분석 결과 받기
        var aiResult = azureSpeechClient.analyzeAudio(
            requestDto.getAudioFileUrl(),
            requestDto.getLang()
        );

        // 2. ai 응답을 가공하여 점수와 피드백 문장 생성
        GeneratedFeedbackResult generated = feedbackGenerator.generate(aiResult);

        // 3. db 저장
        Feedback savedFeedback = feedbackService.saveFeedback(
            requestDto.getUserId(),
            requestDto.getContentsId(),
            requestDto.getLang(),
            generated.getFinalScore(),
            generated.getAccuracy(),
            generated.getFluency(),
            generated.getCompleteness(),
            generated.getMedal(),
            generated.getFeedbackText()
        );

        // 프론트/포스트맨 응답 리턴
        return new FeedbackResponseDto(
                savedFeedback.getFinalScore(),
                savedFeedback.getMedal().name(),
                savedFeedback.getFeedbackText(),
                LocalDateTime.now()
        );
    }

    
    public FeedbackResponseDto processPronunciationFeedback(
        MultipartFile audioFile, 
        Long userId, 
        Long contentsId,
        String lang) {
        throw new UnsupportedOperationException("Unimplemented method 'processPronunciationFeedback'");
    }
}
