package com.aischool.service;

import com.aischool.client.PersoClient;
import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.entity.Contents;
import com.aischool.entity.Script;
import com.aischool.repository.ContentsRepository;
import com.aischool.repository.ScriptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
@Slf4j
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

    /** URL decoding (UTF-8) */
    private static String decodeUtf8(String s) {
        try { return URLDecoder.decode(s, StandardCharsets.UTF_8); }
        catch (Exception e) { return s; }
    }

    /** 여러 키 중 최초로 값이 있는 문자열 반환 (필요 시 사용) */
    private static String firstNonBlank(Map<String, Object> src, String... keys) {
        if (src == null) return null;
        for (String k : keys) {
            String v = getStr(src, k);
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    /** Perso 응답에서 썸네일 URL 선택 (지금은 로컬 탐색을 쓰니 보조용) */
    private static String pickThumbnailUrl(Map<String, Object> data) {
        if (data == null) return null;
        return firstNonBlank(
                data,
                "video_output_thumbnail",
                "input_file_thumbnail_url",
                "thumbnail_url",
                "poster_url",
                "video_thumbnail_url"
        );
    }

    /** URL에서 파일명(제목) 추출 */
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
                String last = path.substring(path.lastIndexOf('/') + 1);
                last = decodeUtf8(last);
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

    /** Dropbox 공유 URL을 실제 다운로드 URL로 정규화(dl.dropboxusercontent.com) */
    private String normalizeInputFileUrl(String url) {
        if (url == null || url.isBlank()) return url;
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host == null || !host.equalsIgnoreCase("www.dropbox.com")) return url;

            String path = uri.getRawPath(); // /s/... 또는 /scl/fi/...
            if (path == null || !path.startsWith("/s")) return url;

            String rlkey = null;
            String query = uri.getRawQuery();
            if (query != null) {
                for (String pair : query.split("&")) {
                    int eq = pair.indexOf('=');
                    String key = eq >= 0 ? pair.substring(0, eq) : pair;
                    String value = eq >= 0 ? pair.substring(eq + 1) : "";
                    if ("rlkey".equals(key)) rlkey = value;
                }
            }

            StringBuilder direct = new StringBuilder("https://dl.dropboxusercontent.com");
            direct.append(path);
            if (rlkey != null && !rlkey.isBlank()) {
                direct.append("?rlkey=").append(rlkey);
            }
            return direct.toString();
        } catch (Exception ex) {
            log.warn("Failed to normalize Dropbox URL: {}", url, ex);
            return url;
        }
    }

    /** ✅ 로컬 썸네일 탐색(여러 후보 경로 + 이름 변형) */
    private static String findLocalThumbPath(String storyTitle) {
        Path wd = Paths.get("").toAbsolutePath();   // 보통 ...\secret\back
        Path parent = wd.getParent();               // 보통 ...\secret

        List<Path> dirCandidates = new ArrayList<>();
        // 현재 작업 디렉토리 기준
        dirCandidates.add(wd.resolve(Paths.get("contents", "thumnail")));   // 오타 폴더 지원
        dirCandidates.add(wd.resolve(Paths.get("contents", "thumbnail")));
        dirCandidates.add(Paths.get("contents", "thumnail"));               // 상대 경로도 시도
        dirCandidates.add(Paths.get("contents", "thumbnail"));
        // back의 형제(프로젝트 루트) 기준
        if (parent != null) {
            dirCandidates.add(parent.resolve(Paths.get("contents", "thumnail")));
            dirCandidates.add(parent.resolve(Paths.get("contents", "thumbnail")));
        }

        log.info("🔎 WD={}", wd);
        if (parent != null) log.info("🔎 PARENT={}", parent);
        for (Path d : dirCandidates) log.info("🔎 탐색: {}", d.toAbsolutePath());

        String base = storyTitle.trim();
        Set<String> nameCandidates = new LinkedHashSet<>(List.of(
                base,
                base.replace(' ', '_'),
                base.replace(' ', '-'),
                base.toLowerCase(Locale.ROOT),
                base.toLowerCase(Locale.ROOT).replace(' ', '_'),
                base.toLowerCase(Locale.ROOT).replace(' ', '-')
        ));
        String[] exts = {".jpg", ".jpeg", ".png", ".webp"};

        for (Path dir : dirCandidates) {
            try {
                if (!Files.isDirectory(dir)) continue;

                // 직접 조합 매칭
                for (String n : nameCandidates) {
                    for (String ext : exts) {
                        Path p = dir.resolve(n + ext);
                        if (Files.isRegularFile(p)) {
                            String found = p.toAbsolutePath().toString();
                            log.info("🖼️ 썸네일 찾음: {}", found);
                            return found;
                        }
                    }
                }
                // 디렉토리 스캔(대소문자/특수문자 차이 대응)
                try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir)) {
                    for (Path p : ds) {
                        if (!Files.isRegularFile(p)) continue;
                        String fname = p.getFileName().toString();
                        int dot = fname.lastIndexOf('.');
                        if (dot < 0) continue;
                        String noExt = fname.substring(0, dot);
                        for (String n : nameCandidates) {
                            if (noExt.equalsIgnoreCase(n)) {
                                String found = p.toAbsolutePath().toString();
                                log.info("🖼️ 썸네일 찾음: {}", found);
                                return found;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("썸네일 탐색 중 예외(무시): dir={}", dir, e);
            }
        }
        log.warn("⚠️ 썸네일을 어떤 후보 경로에서도 찾지 못했습니다. title='{}'", storyTitle);
        return null;
    }

    @Transactional
    public TranslateResponse translateAndSave(TranslateRequest req) throws Exception {
        // 0) 입력 URL 정규화 + 제목 산출
        String inputUrl = normalizeInputFileUrl(req.getInputFileUrl());
        String storyTitle = resolveTitleFromUrl(inputUrl, req.getTitle());

        // 1) 원본 row(일단 duration은 null)
        Contents original = contentsRepo.save(Contents.builder()
                .parentId(null)
                .title(storyTitle)
                .thumbUrl(null) // 로컬 탐색 후 채움
                .language(req.getSourceLang())
                .createdAt(LocalDateTime.now())
                .build());

        // 2) Perso 프로젝트 생성(필수 duration은 PersoClient에서 대체값 전송)
        String uniqueTitleForPerso = storyTitle + "-" + System.currentTimeMillis();
        String inputName = FileStorage.sanitize(uniqueTitleForPerso) + ".mp4";
        Map<String, Object> project = perso.createProject(
                inputName, inputUrl, req.getSourceLang(),
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
            log.debug("[Perso] export {} status={} payload={}", exportId, status, now);
            if ("COMPLETED".equalsIgnoreCase(status)) {
                finalExport = now;
                break;
            }
            if ("FAILED".equalsIgnoreCase(status)) {
                String reason = Optional.ofNullable(getStr(now, "failure_reason"))
                        .orElse(Optional.ofNullable(getStr(now, "failure_reason_detail"))
                                .orElse(Optional.ofNullable(getStr(now, "status_message")).orElse("unknown")));
                log.error("[Perso] export {} failed. reason={} payload={}", exportId, reason, now);
                throw new IllegalStateException("Perso export failed: " + reason);
            }
            log.info("[Perso] export {} processing...", exportId);
        }
        log.info("[Perso] export {} completed", exportId);

        // 4) 결과 비디오 URL 선택
        String outUrl = req.isLipsync()
                ? getStr(finalExport, "video_output_video_with_lipsync")
                : getStr(finalExport, "video_output_video_without_lipsync");
        if (outUrl == null)
            outUrl = Optional.ofNullable(getStr(finalExport, "video_output_video_without_lipsync"))
                    .orElse(getStr(finalExport, "video_output_video_with_lipsync"));
        if (outUrl == null)
            throw new IllegalStateException("No output video url from Perso.");

        // 5) 실제 duration 재조회 (Export 완료 후 Perso가 채웠을 수 있음)
        Map<String, Object> projectDetail = perso.getProject(projectId);
        Integer realDuration = getInt(projectDetail, "input_file_video_duration_sec");

        // 5-1) 그래도 null/1이면 스크립트의 max(end_ms)로 보정
        if (realDuration == null || realDuration <= 1) {
            List<Map<String, Object>> scripts =
                    (List<Map<String, Object>>) projectDetail.getOrDefault("scripts", List.of());
            int maxEnd = 0;
            for (Map<String, Object> s : scripts) {
                Integer end = getInt(s, "end_ms");
                if (end != null && end > maxEnd) maxEnd = end;
            }
            if (maxEnd > 0) {
                realDuration = (maxEnd + 999) / 1000; // ms → s 올림
            }
        }

        // 5-2) 여전히 없으면 요청값이나 0 적용
        if (realDuration == null || realDuration <= 1) {
            realDuration = (req.getDurationSec() != null) ? req.getDurationSec() : 0;
        }

        // 6) 비디오 저장
        String videoName = storyTitle + "_" + req.getTargetLang() + ".mp4";
        String savedVideoPath = storage.downloadToRoot(videoName, outUrl);

        // 6-1) ✅ 로컬 썸네일 탐색 (루트/백 폴더 모두 시도)
        String localThumbPath = findLocalThumbPath(storyTitle);

        // 7) DB 업데이트
        // 원본: duration/썸네일 반영
        original.setDurationSec(realDuration);
        if (localThumbPath != null) original.setThumbUrl(localThumbPath);
        contentsRepo.save(original);

        // 번역본: 로컬 썸네일 경로(없으면 원본과 동일), 비디오 경로, 프로젝트/익스포트ID, duration
        Contents translated = contentsRepo.save(Contents.builder()
                .parentId(original.getContentsId())
                .title(storyTitle)
                .thumbUrl(localThumbPath != null ? localThumbPath : original.getThumbUrl())
                .language(req.getTargetLang())
                .projectId(projectId)
                .exportId(exportId)
                .durationSec(realDuration)
                .contentsPath(savedVideoPath)
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build());

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
                        .orderNo(orderNo)
                        .startMs(startMs)
                        .endMs(endMs)
                        .language("ko")
                        .text(org)
                        .createdAt(LocalDateTime.now())
                        .build());
            }
            if (tr != null && !tr.isBlank() && !targetLang.isBlank()) {
                rows.add(Script.builder()
                        .contentsId(translated.getContentsId())
                        .orderNo(orderNo)
                        .startMs(startMs)
                        .endMs(endMs)
                        .language(targetLang)
                        .text(tr)
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        }
        scriptRepo.saveAll(rows);

        log.info("💾 Saved video: {}", savedVideoPath);
        if (localThumbPath != null) log.info("🖼  Saved thumbnail: {}", localThumbPath);

        return new TranslateResponse(
                translated.getContentsId(),
                translated.getProjectId(),
                translated.getExportId(),
                translated.getContentsPath());
    }
}
