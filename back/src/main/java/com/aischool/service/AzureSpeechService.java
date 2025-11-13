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

    /**
     * ✅ (A) 기존: 음성 분석 후 PronunciationAssessmentResult 반환
     * - DB 저장 시 단순 점수 기반 피드백용
     */
    public PronunciationAssessmentResult analyzeWithConvert(File rawAudio, String referenceText, String lang) throws Exception {
        File wav = convertToWavSafe(rawAudio);
        try {
            return analyzeWav(wav, referenceText, lang);
        } finally {
            try { Files.deleteIfExists(wav.toPath()); } catch (Exception ignore) {}
        }
    }

    /**
     * ✅ (B) 새로 추가: 음성 분석 후 Azure의 원시 JSON 문자열 반환
     * - 세밀 피드백용 (FeedbackGenerator.generate(json)에서 사용)
     */
    public String analyzeWithConvertJson(File rawAudio, String referenceText, String lang) throws Exception {
        File wav = convertToWavSafe(rawAudio);
        try {
            return analyzeWavJson(wav, referenceText, lang);
        } finally {
            try { Files.deleteIfExists(wav.toPath()); } catch (Exception ignore) {}
        }
    }

    /** 1️⃣ ffmpeg 변환: 16kHz / mono / PCM16 wav */
    private File convertToWavSafe(File inputFile) throws IOException, InterruptedException {
        File out = new File(
                inputFile.getParentFile(),
                stripExt(inputFile.getName()) + "-" + UUID.randomUUID() + ".wav"
        );

        // ffmpeg 경로 체크
        String effectiveFfmpeg = findFfmpeg();
        if (effectiveFfmpeg == null) {
            throw new IOException(
                "FFmpeg를 찾을 수 없습니다. Windows에서 설치 방법:\n" +
                "1. choco install ffmpeg (Chocolatey 사용)\n" +
                "2. https://ffmpeg.org/download.html 에서 다운로드 후 PATH 추가\n" +
                "3. application.properties에 ffmpeg.path 설정"
            );
        }

        ProcessBuilder pb = new ProcessBuilder(
                effectiveFfmpeg, "-y",
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

    /** ffmpeg 실행 파일 찾기 */
    private String findFfmpeg() {
        // 1) application.properties 설정 확인
        if (ffmpegPath != null && !ffmpegPath.equals("ffmpeg")) {
            File custom = new File(ffmpegPath);
            if (custom.exists() && custom.canExecute()) {
                return ffmpegPath;
            }
        }

        // 2) PATH에서 ffmpeg 찾기
        String[] candidates = {"ffmpeg", "ffmpeg.exe"};
        for (String cmd : candidates) {
            try {
                Process p = new ProcessBuilder(cmd, "-version").start();
                p.waitFor();
                if (p.exitValue() == 0) {
                    return cmd;
                }
            } catch (Exception ignore) {}
        }

        // 3) 일반적인 Windows 설치 경로
        String[] windowsPaths = {
            "C:\\ffmpeg\\bin\\ffmpeg.exe",
            "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
            System.getenv("ProgramFiles") + "\\ffmpeg\\bin\\ffmpeg.exe",
            System.getenv("LOCALAPPDATA") + "\\Programs\\ffmpeg\\bin\\ffmpeg.exe"
        };
        for (String path : windowsPaths) {
            if (path != null) {
                File f = new File(path);
                if (f.exists() && f.canExecute()) {
                    return path;
                }
            }
        }

        return null;
    }

    /** 2️⃣ Azure Pronunciation Assessment 호출 (WAV → 결과 객체) */
    private PronunciationAssessmentResult analyzeWav(File wavFile, String referenceText, String lang) throws Exception {
        if (referenceText == null || referenceText.isBlank()) {
            throw new IllegalArgumentException("referenceText(기준 문장)이 비어있습니다.");
        }

        SpeechConfig config = SpeechConfig.fromSubscription(speechKey, speechRegion);
        if (lang == null || lang.isBlank()) lang = "en-US";
        config.setSpeechRecognitionLanguage(lang);

        try (AudioConfig audioConfig = AudioConfig.fromWavFileInput(wavFile.getAbsolutePath());
             SpeechRecognizer recognizer = new SpeechRecognizer(config, audioConfig)) {

            PronunciationAssessmentConfig paConfig = new PronunciationAssessmentConfig(
                    referenceText,
                    PronunciationAssessmentGradingSystem.HundredMark,
                    PronunciationAssessmentGranularity.Phoneme
            );
            paConfig.applyTo(recognizer);

            SpeechRecognitionResult result = recognizer.recognizeOnceAsync().get();

            // 오류 처리
            if (result.getReason() != ResultReason.RecognizedSpeech) {
                String err = (result.getReason() == ResultReason.Canceled)
                        ? CancellationDetails.fromResult(result).getReason().toString()
                        : result.getReason().toString();
                throw new RuntimeException("Azure 인식 실패: " + err);
            }

            // PronunciationAssessmentResult 변환
            return PronunciationAssessmentResult.fromResult(result);
        }
    }

    /** 3️⃣ Azure Pronunciation Assessment 호출 (WAV → JSON 반환) */
    private String analyzeWavJson(File wavFile, String referenceText, String lang) throws Exception {
        if (referenceText == null || referenceText.isBlank()) {
            throw new IllegalArgumentException("referenceText(기준 문장)이 비어있습니다.");
        }

        SpeechConfig config = SpeechConfig.fromSubscription(speechKey, speechRegion);
        if (lang == null || lang.isBlank()) lang = "en-US";
        config.setSpeechRecognitionLanguage(lang);

        try (AudioConfig audioConfig = AudioConfig.fromWavFileInput(wavFile.getAbsolutePath());
             SpeechRecognizer recognizer = new SpeechRecognizer(config, audioConfig)) {

            PronunciationAssessmentConfig paConfig = new PronunciationAssessmentConfig(
                    referenceText,
                    PronunciationAssessmentGradingSystem.HundredMark,
                    PronunciationAssessmentGranularity.Phoneme
            );
            paConfig.applyTo(recognizer);

            SpeechRecognitionResult result = recognizer.recognizeOnceAsync().get();

            // 오류 처리
            if (result.getReason() != ResultReason.RecognizedSpeech) {
                String err = (result.getReason() == ResultReason.Canceled)
                        ? CancellationDetails.fromResult(result).getReason().toString()
                        : result.getReason().toString();
                throw new RuntimeException("Azure 인식 실패: " + err);
            }

            // ✅ 핵심: Azure에서 반환한 원시 JSON 문자열 추출
            String json = result.getProperties().getProperty(PropertyId.SpeechServiceResponse_JsonResult);

            if (json == null || json.isEmpty()) {
                throw new RuntimeException("Azure JSON 결과를 가져오지 못했습니다.");
            }

            return json;
        }
    }

    /** 4️⃣ 파일명 유틸 */
    private String stripExt(String name) {
        int idx = name.lastIndexOf('.');
        return (idx > 0) ? name.substring(0, idx) : name;
    }
}
