package com.aischool.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.io.File;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * 임시 저장된 오디오 파일(.webm, .wav)을 자동 삭제하는 스케줄러
 * - 1시간마다 실행
 * - 생성(수정)된 지 60분이 지난 파일만 삭제
 * - record_ 로 시작하는 파일만 대상으로 함
 */
@Component
public class TempFileCleaner {

    // 시스템 기본 임시 저장 경로 (File.createTempFile()이 사용하는 위치)
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir");

    // 파일 최대 보관 시간 (분 단위)
    private static final long MAX_AGE_MINUTES = 60;

    /**
     * 매 1시간마다 실행 (매시 정각)
     * cron = "0 0 * * * *"
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanTempFiles() {
        File dir = new File(TEMP_DIR);
        if (!dir.exists() || !dir.isDirectory()) return;

        // .webm 또는 .wav 확장자 파일만 검색
        File[] files = dir.listFiles((d, name) ->
                name.startsWith("record_") && (name.endsWith(".webm") || name.endsWith(".wav"))
        );

        if (files == null) return;

        Instant now = Instant.now();

        for (File file : files) {
            long ageMinutes = ChronoUnit.MINUTES.between(
                    Instant.ofEpochMilli(file.lastModified()), now);

            if (ageMinutes > MAX_AGE_MINUTES) {
                boolean deleted = file.delete();
                if (deleted) {
                    System.out.println("[TempFileCleaner] 삭제됨: " + file.getName());
                } else {
                    System.out.println("[TempFileCleaner] 삭제 실패: " + file.getName());
                }
            }
        }
    }
}
