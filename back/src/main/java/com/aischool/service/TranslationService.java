package com.aischool.service;

import com.aischool.client.PersoClient;
import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.entity.Contents;
import com.aischool.entity.Script;
import com.aischool.repository.ContentsRepository;
import com.aischool.repository.ScriptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final PersoClient perso;
    private final FileStorage storage;
    private final ContentsRepository contentsRepo;
    private final ScriptRepository scriptRepo;

    @Value("${storage.root-dir}")
    private String rootDir;

    private static String getStr(Map<String, Object> m, String k) {
        return m.get(k) == null ? null : m.get(k).toString();
    }

    private static Integer getInt(Map<String, Object> m, String k) {
        Object v = m.get(k);
        if (v == null)
            return null;
        if (v instanceof Number n)
            return n.intValue();
        try {
            return Integer.parseInt(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    /** 엔드투엔드: 프로젝트 생성 → 초기 Export → 완료 대기 → 영상 저장 → 스크립트 저장 */
    @Transactional
    public TranslateResponse translateAndSave(TranslateRequest req) throws Exception {

        Contents original = contentsRepo.save(Contents.builder()
                .title(Optional.ofNullable(req.getTitle()).orElse("Untitled"))
                .thumbUrl(req.getThumbUrl())
                .language(req.getSourceLang())
                .createdAt(LocalDateTime.now())
                .build());

        String inputName = Optional.ofNullable(req.getTitle()).orElse("input") + ".mp4";

        Map<String, Object> project = perso.createProject(
                inputName,
                req.getInputFileUrl(),
                req.getSourceLang(),
                req.getDurationSec(), // null이면 PersoClient가 기본값 처리
                req.getNumberOfSpeakers());
        String projectId = getStr(project, "project_id");
        System.out.println("🎬 [Perso] Project created: " + projectId);

        // INITIAL_EXPORT 생성
        Map<String, Object> export = perso.createExport(
                projectId,
                req.getTargetLang(),
                "INITIAL_EXPORT",
                req.isLipsync(),
                req.isWatermark(),
                "");
        String exportId = getStr(export, "projectexport_id");
        System.out.println("🚀 [Perso] Export started: " + exportId);

        // 상태 폴링
        Map<String, Object> finalExport;
        int attempt = 0;
        while (true) {
            Thread.sleep(5_000);
            attempt++;

            Map<String, Object> now = perso.getExport(exportId);
            String status = getStr(now, "status");

            if ("COMPLETED".equalsIgnoreCase(status)) {
                System.out.println("✅ [Perso] Export completed (" + attempt + " checks)");
                finalExport = now;
                break;
            }
            if ("FAILED".equalsIgnoreCase(status)) {
                System.err.println("❌ [Perso] Export failed: " + getStr(now, "failure_reason"));
                throw new IllegalStateException("Perso export failed: " + getStr(now, "failure_reason"));
            }

            // 진행중이면 상태 출력
            System.out.print("⏳ [Perso] Processing " + attempt + "...");
            if (attempt % 5 == 0)
                System.out.println(); // 줄바꿈
        }

        // 완료 후 경로 확인
        String outUrl = req.isLipsync()
                ? getStr(finalExport, "video_output_video_with_lipsync")
                : getStr(finalExport, "video_output_video_without_lipsync");

        System.out.println("📦 [Perso] Downloading from: " + outUrl);

        String subDir = original.getContentsId() + "_" + req.getTargetLang();
        String savedPath = storage.downloadTo(subDir, "output.mp4", outUrl);
        System.out.println("💾 [Saved] " + savedPath);

        // Perso 프로젝트 상세 가져와서 진짜 duration 저장
        Map<String, Object> projectDetail = perso.getProject(projectId);
        Integer realDuration = getInt(projectDetail, "input_file_video_duration_sec");

        Contents translated = contentsRepo.save(Contents.builder()
                .parentId(original.getContentsId())
                .title(original.getTitle())
                .thumbUrl(original.getThumbUrl())
                .language(req.getTargetLang())
                .projectId(projectId)
                .exportId(exportId)
                .durationSec(realDuration)
                .contentsPath(savedPath)
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build());

        System.out.println("✅ [DB] Translation saved (contentsId=" + translated.getContentsId() + ")");
        return new TranslateResponse(
                translated.getContentsId(),
                translated.getProjectId(),
                translated.getExportId(),
                translated.getContentsPath());
    }
}
