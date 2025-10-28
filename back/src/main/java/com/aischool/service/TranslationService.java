package com.aischool.service;

import com.aischool.client.PersoClient;
import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.entity.Contents;
import com.aischool.entity.Script;
import com.aischool.repository.ContentsRepository;
import com.aischool.repository.ScriptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final PersoClient perso;
    private final FileStorage storage;
    private final ContentsRepository contentsRepo;
    private final ScriptRepository scriptRepo;

    /* ---------- 공용 유틸 ---------- */
    private static String getStr(Map<String, Object> m, String k) {
        return m.get(k) == null ? null : m.get(k).toString();
    }
    private static Integer getInt(Map<String, Object> m, String k) {
        Object v = m.get(k);
        if (v == null) return null;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return null; }
    }
    private static String decodeUtf8(String s) {
        try { return URLDecoder.decode(s, StandardCharsets.UTF_8); }
        catch (Exception e) { return s; }
    }

    /** URL의 진짜 파일명 우선으로 타이틀 결정 */
    private String resolveTitleFromUrl(String url, String fallback) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new java.net.URL(url).openConnection();
            conn.setInstanceFollowRedirects(true);
            conn.setRequestMethod("HEAD");
            conn.setConnectTimeout(10_000);
            conn.setReadTimeout(10_000);
            conn.connect();

            String cd = conn.getHeaderField("Content-Disposition");
            if (cd != null) {
                var m1 = Pattern.compile("filename\\*=UTF-8''([^;]+)").matcher(cd);
                if (m1.find()) {
                    String name = decodeUtf8(m1.group(1));
                    int dot = name.lastIndexOf('.');
                    return FileStorage.sanitize(dot > 0 ? name.substring(0, dot) : name);
                }
                var m2 = Pattern.compile("filename=\"?([^\";]+)\"?").matcher(cd);
                if (m2.find()) {
                    String name = decodeUtf8(m2.group(1));
                    int dot = name.lastIndexOf('.');
                    return FileStorage.sanitize(dot > 0 ? name.substring(0, dot) : name);
                }
            }
        } catch (Exception ignore) { /* fallback */ }

        try {
            String path = new URI(url).getPath();
            if (path != null) {
                String last = decodeUtf8(path.substring(path.lastIndexOf('/') + 1));
                if (!last.isBlank()) {
                    int dot = last.lastIndexOf('.');
                    String base = dot > 0 ? last.substring(0, dot) : last;
                    return FileStorage.sanitize(base);
                }
            }
        } catch (Exception ignore) { /* fallback */ }

        String fb = (fallback == null || fallback.isBlank()) ? "Untitled" : fallback;
        return FileStorage.sanitize(fb);
    }

    /* ---------- 메인 플로우 ---------- */
    @Transactional
    public TranslateResponse translateAndSave(TranslateRequest req) throws Exception {
        // 0) 타이틀
        String storyTitle = resolveTitleFromUrl(req.getInputFileUrl(), req.getTitle());

        // 1) 원본 row (우선 생성)
        Contents original = contentsRepo.save(Contents.builder()
                .parentId(null)
                .title(storyTitle)
                .thumbUrl(req.getThumbUrl())
                .language(req.getSourceLang())
                .createdAt(LocalDateTime.now())
                .build());

        // 2) Perso 프로젝트 생성
        String inputName = storyTitle + ".mp4";
        Map<String, Object> project = perso.createProject(
                inputName, req.getInputFileUrl(), req.getSourceLang(),
                req.getDurationSec(), req.getNumberOfSpeakers());
        String projectId = getStr(project, "project_id");

        // 3) INITIAL_EXPORT 생성 → 완료 대기
        Map<String, Object> export = perso.createExport(
                projectId, req.getTargetLang(), "INITIAL_EXPORT",
                req.isLipsync(), req.isWatermark(), "");
        String exportId = getStr(export, "projectexport_id");

        Map<String, Object> finalExport;
        while (true) {
            Thread.sleep(5_000);
            Map<String, Object> now = perso.getExport(exportId);
            String status = getStr(now, "status");
            if ("COMPLETED".equalsIgnoreCase(status)) { finalExport = now; break; }
            if ("FAILED".equalsIgnoreCase(status)) {
                throw new IllegalStateException("Perso export failed: " + getStr(now, "failure_reason"));
            }
            System.out.print("⏳ [Perso] Processing...");
        }
        System.out.println();

        // 4) 번역본 다운로드 URL
        String outUrl = req.isLipsync()
                ? getStr(finalExport, "video_output_video_with_lipsync")
                : getStr(finalExport, "video_output_video_without_lipsync");
        if (outUrl == null)
            outUrl = Optional.ofNullable(getStr(finalExport, "video_output_video_without_lipsync"))
                    .orElse(getStr(finalExport, "video_output_video_with_lipsync"));
        if (outUrl == null)
            throw new IllegalStateException("No output video url from Perso.");

        // 5) 실제 duration 조회
        Map<String, Object> projectDetail = perso.getProject(projectId);
        Integer realDuration = getInt(projectDetail, "input_file_video_duration_sec");

        /* 5-1) ✅ 원본 영상도 저장: contents/<타이틀>_<원본언어>.mp4 */
        String sourceName = storyTitle + "_" + req.getSourceLang() + ".mp4";
        String sourcePath = storage.downloadTo("contents", sourceName, req.getInputFileUrl());
        original.setContentsPath(sourcePath);
        original.setDurationSec(realDuration);
        original.setCompletedAt(LocalDateTime.now());
        contentsRepo.save(original);

        // 6) 번역본 row
        Contents translated = contentsRepo.save(Contents.builder()
                .parentId(original.getContentsId())
                .title(storyTitle)
                .thumbUrl(original.getThumbUrl())
                .language(req.getTargetLang())
                .projectId(projectId)
                .exportId(exportId)
                .durationSec(realDuration)                // ✅ 실제 길이 저장
                .createdAt(LocalDateTime.now())
                .build());

        // 7) 번역 영상 저장: contents/<타이틀>_<타깃언어>.mp4
        String translatedName = storyTitle + "_" + req.getTargetLang() + ".mp4";
        String translatedPath = storage.downloadTo("contents", translatedName, outUrl);
        translated.setContentsPath(translatedPath);
        translated.setCompletedAt(LocalDateTime.now());
        contentsRepo.save(translated);

        // 8) 스크립트 저장 (줄×언어=1행)
        List<Map<String, Object>> scripts =
                (List<Map<String, Object>>) projectDetail.getOrDefault("scripts", List.of());

        List<Script> rows = new ArrayList<>();
        String targetLang = Optional.ofNullable(translated.getLanguage()).orElse("").toLowerCase(Locale.ROOT);

        for (Map<String, Object> s : scripts) {
            Integer orderNo = getInt(s, "order");
            Integer startMs = getInt(s, "start_ms");
            Integer endMs   = getInt(s, "end_ms");
            String  org     = getStr(s, "text_original");
            String  tr      = getStr(s, "text_translated");

            if (org != null && !org.isBlank()) {
                rows.add(Script.builder()
                        .contentsId(translated.getContentsId())
                        .orderNo(orderNo).startMs(startMs).endMs(endMs)
                        .language("ko").text(org)
                        .createdAt(LocalDateTime.now()).build());
            }
            if (tr != null && !tr.isBlank() && !targetLang.isBlank()) {
                rows.add(Script.builder()
                        .contentsId(translated.getContentsId())
                        .orderNo(orderNo).startMs(startMs).endMs(endMs)
                        .language(targetLang).text(tr)
                        .createdAt(LocalDateTime.now()).build());
            }
        }
        scriptRepo.saveAll(rows);

        System.out.println("💾 Saved original: " + sourcePath);
        System.out.println("💾 Saved translated: " + translatedPath);

        return new TranslateResponse(
                translated.getContentsId(),
                translated.getProjectId(),
                translated.getExportId(),
                translated.getContentsPath());
    }
}
