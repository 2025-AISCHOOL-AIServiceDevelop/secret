package com.aischool.service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aischool.client.AzureSpeechClient;
import com.aischool.dto.FeedbackRequestDto;
import com.aischool.dto.FeedbackResponseDto;
import com.aischool.entity.Feedback;
import com.aischool.entity.Script;
import com.aischool.repository.FeedbackRepository;
import com.aischool.repository.ScriptRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final AzureSpeechClient azureSpeechClient;
    private final FeedbackGenerator feedbackGenerator;
    private final FeedbackService feedbackService;
    private final AzureSpeechService azureSpeechService;
    private final ScriptRepository scriptRepository;
    private final FeedbackRepository feedbackRepository;

    /**
     * 🌐 프론트에서 어떤 언어 코드를 보내도(en-US, zh-CN ...)
     *    → 우리가 사용하는 규격(en, zh, ko...) 으로 변환.
     */
    private String normalizeLang(String lang) {
        if (lang == null || lang.isEmpty()) return "en";

        lang = lang.toLowerCase(Locale.ROOT);

        // en-US → en
        if (lang.contains("-")) {
            lang = lang.split("-")[0];
        }

        return switch (lang) {
            case "en", "ko", "ja", "zh", "th", "vi", "ru" -> lang;
            default -> throw new RuntimeException("지원하지 않는 언어 코드: " + lang);
        };
    }

    /**
     * Azure Speech API가 요구하는 locale 변환
     * (내부 규격 → Azure 규격)
     */
    private String mapToAzureLocale(String lang) {
        return switch (lang.toLowerCase()) {
            case "en" -> "en-US";
            case "ko" -> "ko-KR";
            case "ja" -> "ja-JP";
            case "zh" -> "zh-CN";
            case "th" -> "th-TH";
            case "vi" -> "vi-VN";
            case "ru" -> "ru-RU";
            default -> throw new IllegalArgumentException("지원하지 않는 언어 코드: " + lang);
        };
    }

    /**
     * 📌 URL 기반 분석(createFeedback)
     */
    public FeedbackResponseDto createFeedback(FeedbackRequestDto requestDto) {

        // 프론트 언어 → 내부표준
        String normLang = normalizeLang(requestDto.getLang());
        String azureLocale = mapToAzureLocale(normLang);

        var aiResult = azureSpeechClient.analyzeAudio(
                requestDto.getAudioFileUrl(),
                azureLocale
        );

        // 언어를 feedbackGenerator에 전달하도록 변경
        GeneratedFeedbackResult generated = feedbackGenerator.generate(aiResult, normLang);

        Feedback savedFeedback = feedbackService.saveFeedback(
                requestDto.getUserId(),
                requestDto.getContentsId(),
                requestDto.getScriptId(),
                normLang,
                generated.getFinalScore(),
                generated.getAccuracy(),
                generated.getFluency(),
                generated.getCompleteness(),
                generated.getMedal(),
                generated.getFeedbackText()
        );

        return FeedbackResponseDto.fromEntity(savedFeedback);
    }

    /**
     * 📌 파일 업로드 기반 발음 분석 (POST /analyze)
     */
    public FeedbackResponseDto processPronunciationFeedback(
            MultipartFile audioFile,
            Long userId,
            Long contentsId,
            Long scriptId,
            String lang
    ) {
        File tempFile = null;

        try {
            // 언어 정규화
            String normLang = normalizeLang(lang);
            String azureLocale = mapToAzureLocale(normLang);

            // script 조회
            Script script = scriptRepository.findById(scriptId.intValue())
                    .orElseThrow(() -> new RuntimeException("해당 scriptId의 문장을 찾을 수 없습니다."));
            String targetSentence = script.getText();

            // 업로드 파일 임시 저장
            tempFile = File.createTempFile("record_", ".webm");
            audioFile.transferTo(tempFile);

            // Azure 분석(JSON)
            String azureJson = azureSpeechService.analyzeWithConvertJson(
                    tempFile,
                    targetSentence,
                    azureLocale
            );

            // 언어별 피드백 생성
            GeneratedFeedbackResult generated = feedbackGenerator.generate(azureJson, normLang);

            // DB 저장
            Feedback savedFeedback = feedbackService.saveFeedback(
                    userId,
                    contentsId,
                    scriptId,
                    normLang,
                    generated.getFinalScore(),
                    generated.getAccuracy(),
                    generated.getFluency(),
                    generated.getCompleteness(),
                    generated.getMedal(),
                    generated.getFeedbackText()
            );

            // 응답 리턴
            return FeedbackResponseDto.builder()
                    .feedbackId(savedFeedback.getFeedbackId())
                    .userId(userId)
                    .contentsId(contentsId)
                    .scriptId(scriptId)
                    .scriptText(targetSentence)
                    .lang(normLang)
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
        } finally {
            if (tempFile != null && tempFile.exists()) {
                boolean deleted = tempFile.delete();
                if (deleted)
                    System.out.println("[TempFileCleaner] 즉시 삭제됨: " + tempFile.getName());
                else
                    System.out.println("[TempFileCleaner] 삭제 실패(스케줄러가 처리 예정): " + tempFile.getName());
            }
        }
    }

    public FeedbackResponseDto getLatestFeedback(Long userId, Long contentsId, Long scriptId) {

        Feedback latest = feedbackRepository
                .findTopByUserIdAndContentsIdAndScriptIdOrderByFeedbackDateDesc(userId, contentsId, scriptId)
                .orElseThrow(() -> new RuntimeException("해당 피드백이 존재하지 않습니다."));

        Script script = scriptRepository.findById(scriptId.intValue())
                .orElseThrow(() -> new RuntimeException("스크립트 정보를 찾을 수 없습니다."));

        return FeedbackResponseDto.builder()
                .feedbackId(latest.getFeedbackId())
                .userId(userId)
                .contentsId(contentsId)
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
