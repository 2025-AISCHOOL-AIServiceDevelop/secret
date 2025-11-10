package com.aischool.service;

import java.io.File;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aischool.client.AzureSpeechClient;
import com.aischool.dto.FeedbackRequestDto;
import com.aischool.dto.FeedbackResponseDto;
import com.aischool.entity.Feedback;
import com.aischool.entity.Script;
import com.aischool.repository.FeedbackRepository;
import com.aischool.repository.ScriptRepository;
import com.microsoft.cognitiveservices.speech.PronunciationAssessmentResult;

import lombok.RequiredArgsConstructor;

// 발음 분석 / 점수 계산 / 피드백 문장 생성 담당 서비스

@Service
@RequiredArgsConstructor
public class TutorService {

    private final AzureSpeechClient azureSpeechClient;
    private final FeedbackGenerator feedbackGenerator;
    private final FeedbackService feedbackService;
    private final AzureSpeechService azureSpeechService;
    private final ScriptRepository scriptRepository;
    private final FeedbackRepository feedbackRepository;


    private String getMedalFromScore(double score) {
        if (score >= 85)
            return "GOLD";
        else if (score >= 70)
            return "SILVER";
        else
            return "BRONZE";
    }

    public FeedbackResponseDto createFeedback(FeedbackRequestDto requestDto) {

        // 기본정보 확인
        Long userId = requestDto.getUserId();
        String targetSentence = requestDto.getTargetSentence();
        String filePath = requestDto.getRecordedFilePath();

        // azure api에 음성 파일 전송 + 분석 결과 받기
        var aiResult = azureSpeechClient.analyzeAudio(
                requestDto.getAudioFileUrl(),
                requestDto.getLang());

        // 2. ai 응답을 가공하여 점수와 피드백 문장 생성
        GeneratedFeedbackResult generated = feedbackGenerator.generate(aiResult);

        // 3. db 저장
        Feedback savedFeedback = feedbackService.saveFeedback(
                requestDto.getUserId(),
                requestDto.getContentsId(),
                requestDto.getScriptId(),
                requestDto.getLang(),
                generated.getFinalScore(),
                generated.getAccuracy(),
                generated.getFluency(),
                generated.getCompleteness(),
                generated.getMedal(),
                generated.getFeedbackText());

        // 프론트/포스트맨 응답 리턴
        return FeedbackResponseDto.fromEntity(savedFeedback);
    }

    public FeedbackResponseDto processPronunciationFeedback(
        MultipartFile audioFile,
        Long userId,
        Long contentsId,
        Long scriptId,
        String lang
) {
        File tempFile = null; // finally에서 접근 가능하도록 try 밖에서 선언
    try {
        // 1️⃣ scriptId로 문장 텍스트 조회
        Script script = scriptRepository.findById(scriptId.intValue())
                .orElseThrow(() -> new RuntimeException("해당 scriptId의 문장을 찾을 수 없습니다."));
        String targetSentence = script.getText();

        // 2️⃣ 업로드된 파일을 임시로 로컬에 저장
        tempFile = File.createTempFile("record_", ".webm");
        audioFile.transferTo(tempFile);

        // 3️⃣ Azure 발음 평가 실행 (JSON 결과 받기)
        String azureJson = azureSpeechService.analyzeWithConvertJson(
                tempFile,
                targetSentence,
                lang
        );

        // 4️⃣ 세밀한 피드백 생성
        GeneratedFeedbackResult generated = feedbackGenerator.generate(azureJson);

        // 5️⃣ DB 저장
        Feedback savedFeedback = feedbackService.saveFeedback(
                userId,
                contentsId,
                scriptId,
                lang,
                generated.getFinalScore(),
                generated.getAccuracy(),
                generated.getFluency(),
                generated.getCompleteness(),
                generated.getMedal(),
                generated.getFeedbackText()
        );

        // 6️⃣ 프론트 응답 리턴 (✅ scriptText 포함되도록 수정)
        return FeedbackResponseDto.builder()
                .feedbackId(savedFeedback.getFeedbackId())
                .userId(userId)
                .contentsId(contentsId)
                .scriptId(scriptId)
                .scriptText(targetSentence)  
                .lang(lang)
                .finalScore(generated.getFinalScore())
                .accuracy(generated.getAccuracy())
                .fluency(generated.getFluency())
                .completeness(generated.getCompleteness())
                .medal(generated.getMedal())
                .feedbackText(generated.getFeedbackText())
                .feedbackDate(savedFeedback.getFeedbackDate())
                .build();

    } catch (Exception e) {
        throw new RuntimeException("발음 분석 중 오류: " + e.getMessage());
    } finally{
        // 분석이 끝난 후 임시 파일 삭제 시도 (예외 발생 여부 상관없이 실행)
        if (tempFile != null && tempFile.exists()){
                boolean deleted = tempFile.delete(); 
                if (deleted){
                        System.out.println("[TempFileCleaner] 즉시 삭제됨: " + tempFile.getName());
                } else {
                         System.out.println("[TempFileCleaner] 삭제 실패(스케줄러가 처리 예정): " + tempFile.getName());
                }
        }
    }
}


    public FeedbackResponseDto getLatestFeedback(Long userId, Long contentsId, Long scriptId) {
    Feedback latest = feedbackRepository
            .findTopByUserIdAndContentsIdAndScriptIdOrderByFeedbackDateDesc(userId, contentsId, scriptId)
            .orElseThrow(() -> new RuntimeException("해당 피드백이 존재하지 않습니다."));

    // script 텍스트도 함께 반환하고 싶다면
    Script script = scriptRepository.findById(scriptId.intValue())
            .orElseThrow(() -> new RuntimeException("스크립트 정보를 찾을 수 없습니다."));

    // ✅ FeedbackResponseDto에 scriptText 포함
    return FeedbackResponseDto.builder()
            .feedbackId(latest.getFeedbackId())
            .userId(latest.getUserId())
            .contentsId(latest.getContentsId())
            .scriptId(scriptId)
            .scriptText(script.getText()) 
            .lang(latest.getLang())
            .finalScore(latest.getFinalScore())
            .accuracy(latest.getAccuracy())
            .fluency(latest.getFluency())
            .completeness(latest.getCompleteness())
            .medal(latest.getMedal().name())
            .feedbackText(latest.getFeedbackText())
            .feedbackDate(latest.getFeedbackDate())
            .build();
    }
}
