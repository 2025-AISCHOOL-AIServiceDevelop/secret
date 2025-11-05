package com.aischool.service;

import com.microsoft.cognitiveservices.speech.*;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.UUID;

@Service
public class AzureSpeechService {

    @Value("${azure.speech.key}")
    private String speechKey;

    @Value("${azure.speech.region}")
    private String speechRegion;

    @Value("${ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    /** 외부에서 호출: 원본 -> 변환 -> Azure 분석 -> 결과 */
    public PronunciationAssessmentResult analyzeWithConvert(File rawAudio, String referenceText, String lang) throws Exception {
        File wav = convertToWavSafe(rawAudio);
        try {
            return analyzeWav(wav, referenceText, lang);
        } finally {
            try { Files.deleteIfExists(wav.toPath()); } catch (Exception ignore) {}
        }
    }

    /** 1) ffmpeg 변환: 16kHz/mono/PCM16 wav */
    private File convertToWavSafe(File inputFile) throws IOException, InterruptedException {
        File out = new File(
                inputFile.getParentFile(),
                stripExt(inputFile.getName()) + "-" + UUID.randomUUID() + ".wav"
        );

        ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath, "-y",
                "-i", inputFile.getAbsolutePath(),
                "-ar", "16000",
                "-ac", "1",
                "-acodec", "pcm_s16le",
                out.getAbsolutePath()
        );
        pb.redirectErrorStream(true);

        Process process = pb.start();

        // ffmpeg 로그 캡처(디버깅용)
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                // System.out.println("[ffmpeg] " + line);
            }
        }

        int exit = process.waitFor();
        if (exit != 0 || !out.exists() || out.length() == 0) {
            throw new IOException("ffmpeg 변환 실패(exit=" + exit + "). ffmpeg 경로/입력파일/코덱을 확인하세요.");
        }
        return out;
    }

    /** 2) Azure Pronunciation Assessment 호출 (WAV 전제) */
    private PronunciationAssessmentResult analyzeWav(File wavFile, String referenceText, String lang) throws Exception {
        if (referenceText == null || referenceText.isBlank()) {
            throw new IllegalArgumentException("referenceText(기준 문장)이 비어있습니다.");
        } 

        SpeechConfig config = SpeechConfig.fromSubscription(speechKey, speechRegion);
        if (lang == null || lang.isBlank()) lang = "en-US";
        config.setSpeechRecognitionLanguage(lang);

        // PronunciationAssessment 결과를 JSON 형태로 포함시키기
        config.setProperty(PropertyId.SpeechServiceResponse_JsonResult, "true");

        try (AudioConfig audioConfig = AudioConfig.fromWavFileInput(wavFile.getAbsolutePath());
             SpeechRecognizer recognizer = new SpeechRecognizer(config, audioConfig)) {

            // 발음평가 설정 생성 (루트 패키지에서 가져옴)
            PronunciationAssessmentConfig paConfig = new PronunciationAssessmentConfig(
                    referenceText,
                    PronunciationAssessmentGradingSystem.HundredMark,
                    PronunciationAssessmentGranularity.Phoneme
            );
            paConfig.applyTo(recognizer);

            // 음성 인식 실행
            SpeechRecognitionResult result = recognizer.recognizeOnceAsync().get();

            // 오류 케이스 처리
            if (result.getReason() != ResultReason.RecognizedSpeech) {
                String err = (result.getReason() == ResultReason.Canceled)
                        ? CancellationDetails.fromResult(result).getReason().toString()
                        : result.getReason().toString();
                throw new RuntimeException("Azure 인식 실패: " + err);
            }

            // 최신 SDK에서는 fromResult()로 변환해야 함
            return PronunciationAssessmentResult.fromResult(result);
        }
    }

    /** 유틸: 확장자 제거 */
    private String stripExt(String name) {
        int idx = name.lastIndexOf('.');
        return (idx > 0) ? name.substring(0, idx) : name;
    }
}
