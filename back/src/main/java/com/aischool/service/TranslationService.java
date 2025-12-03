package com.aischool.service;

import com.aischool.client.PersoClient;
import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.entity.Contents;
import com.aischool.entity.Script;
import com.aischool.repository.ContentsRepository;
import com.aischool.repository.ScriptRepository;
import com.aischool.util.ContentsPathUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

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
    private final ThumbnailUrlService thumbnailUrlService;

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

    /** 키 후보 중에서 처음으로 값이 있는 문자열 반환 (작은 유틸) */
    private static String firstNonBlank(Map<String, Object> src, String... keys) {
        if (src == null) return null;
        for (String k : keys) {
            String v = getStr(src, k);
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }


    /** Perso 응답에서 썸네일 URL 선택 (로컬 썸네일 탐색과 별개) */
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

    /** URL에서 파일명(=제목) 추출 */
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

    /** Dropbox 공유 URL을 직접 다운로드 URL로 변환 (dl.dropboxusercontent.com) */
    private String normalizeInputFileUrl(String url) {
        if (url == null || url.isBlank()) return url;
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host == null || !host.equalsIgnoreCase("www.dropbox.com")) return url;

            // /s/... 또는 /scl/fi/... 만 변환 허용
            String path = uri.getRawPath();
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

    /** 로컬 썸네일 탐색(후보 경로 + 이름 변형) */
    private static String findLocalThumbPath(String storyTitle) {
        Path wd = Paths.get("").toAbsolutePath();   // ...\secret\back
        Path parent = wd.getParent();               // ...\secret

        List<Path> dirCandidates = new ArrayList<>();
        // 현재 작업 폴더 기준 후보 경로
        dirCandidates.add(wd.resolve(Paths.get("contents", "thumnail")));   // 오타 폴더도 탐색
        dirCandidates.add(wd.resolve(Paths.get("contents", "thumbnail")));
        dirCandidates.add(Paths.get("contents", "thumnail"));               // 상대 경로도 탐색
        dirCandidates.add(Paths.get("contents", "thumbnail"));
        // back 상위(모노레포 루트) 기준 후보 경로
        if (parent != null) {
            dirCandidates.add(parent.resolve(Paths.get("contents", "thumnail")));
            dirCandidates.add(parent.resolve(Paths.get("contents", "thumbnail")));
        }

        log.info("[Thumb] WD={}", wd);
        if (parent != null) log.info("[Thumb] PARENT={}", parent);
        for (Path d : dirCandidates) log.info("[Thumb] 후보 경로: {}", d.toAbsolutePath());

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

                // 정확히 동일한 파일명 우선 탐색
                for (String n : nameCandidates) {
                    for (String ext : exts) {
                        Path p = dir.resolve(n + ext);
                        if (Files.isRegularFile(p)) {
                            String found = p.toAbsolutePath().toString();
                            log.info("[Thumb] 발견: {}", found);
                            return found;
                        }
                    }
                }
                // 디렉터리 전체 스캔(대소문자/특수문자 이슈 대응)
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
                                log.info("[Thumb] 발견: {}", found);
                                return found;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[Thumb] 탐색 예외: dir={}", dir, e);
            }
        }
        log.warn("[Thumb] 제목 '{}'에 해당하는 썸네일을 로컬에서 찾지 못했습니다.", storyTitle);
        return null;
    }

    /** 로컬 동영상 탐색(후보 경로 + 이름 변형) */
    private static String findLocalVideoPath(String storyTitle) {
        Path wd = Paths.get("").toAbsolutePath();   // ...\secret\back
        Path parent = wd.getParent();               // ...\secret

        List<Path> dirCandidates = new ArrayList<>();
        // 현재 작업 폴더 기준
        dirCandidates.add(wd.resolve(Paths.get("contents")));
        dirCandidates.add(wd.resolve(Paths.get("contents", "video")));
        dirCandidates.add(wd.resolve(Paths.get("contents", "videos")));
        // 상대 경로도 시도
        dirCandidates.add(Paths.get("contents"));
        dirCandidates.add(Paths.get("contents", "video"));
        dirCandidates.add(Paths.get("contents", "videos"));
        // 상위 기준
        if (parent != null) {
            dirCandidates.add(parent.resolve(Paths.get("contents")));
            dirCandidates.add(parent.resolve(Paths.get("contents", "video")));
            dirCandidates.add(parent.resolve(Paths.get("contents", "videos")));
        }

        String base = storyTitle.trim();
        Set<String> nameCandidates = new LinkedHashSet<>(List.of(
                base,
                base.replace(' ', '_'),
                base.replace(' ', '-'),
                base.toLowerCase(Locale.ROOT),
                base.toLowerCase(Locale.ROOT).replace(' ', '_'),
                base.toLowerCase(Locale.ROOT).replace(' ', '-')
        ));
        String[] exts = {".mp4", ".mov", ".m4v", ".mkv", ".webm"};

        for (Path dir : dirCandidates) {
            try {
                if (!Files.isDirectory(dir)) continue;

                // 정확 매칭 우선
                for (String n : nameCandidates) {
                    for (String ext : exts) {
                        Path p = dir.resolve(n + ext);
                        if (Files.isRegularFile(p)) {
                            String found = ContentsPathUtil.normalize(p);
                            log.info("[Video] 발견: {}", found);
                            return found;
                        }
                    }
                }
                // 느슨 스캔
                try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir)) {
                    for (Path p : ds) {
                        if (!Files.isRegularFile(p)) continue;
                        String fname = p.getFileName().toString();
                        int dot = fname.lastIndexOf('.');
                        if (dot < 0) continue;
                        String noExt = fname.substring(0, dot);
                        for (String n : nameCandidates) {
                            if (noExt.equalsIgnoreCase(n)) {
                                String found = ContentsPathUtil.normalize(p);
                                log.info("[Video] 발견: {}", found);
                                return found;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[Video] 탐색 예외: dir={}", dir, e);
            }
        }
        log.warn("[Video] 제목 '{}'에 해당하는 로컬 동영상을 찾지 못했습니다.", storyTitle);
        return null;
    }

    private String buildSourceKey(String normalizedInputUrl, String sourceLang) {
        if (normalizedInputUrl == null || normalizedInputUrl.isBlank()) return null;
        String lang = Optional.ofNullable(sourceLang).orElse("").trim().toLowerCase(Locale.ROOT);
        String payload = normalizedInputUrl.trim().toLowerCase(Locale.ROOT) + "|" + lang;
        return DigestUtils.md5DigestAsHex(payload.getBytes(StandardCharsets.UTF_8));
    }

    private Contents resolveOriginalContents(String sourceKey, String storyTitle, String sourceLang) {
        if (sourceKey != null && !sourceKey.isBlank()) {
            Optional<Contents> byKey = contentsRepo.findFirstBySourceKeyAndParentIdIsNull(sourceKey);
            if (byKey.isPresent()) return byKey.get();
        }

        if (storyTitle != null && !storyTitle.isBlank()
                && sourceLang != null && !sourceLang.isBlank()) {
            Optional<Contents> byTitle = contentsRepo
                    .findFirstByTitleIgnoreCaseAndLanguageAndParentIdIsNull(storyTitle, sourceLang);
            if (byTitle.isPresent()) {
                Contents original = byTitle.get();
                if (sourceKey != null
                        && (original.getSourceKey() == null || !original.getSourceKey().equals(sourceKey))) {
                    original.setSourceKey(sourceKey);
                    return contentsRepo.save(original);
                }
                return original;
            }
        }

        return contentsRepo.save(Contents.builder()
                .parentId(null)
                .title(storyTitle)
                .thumbUrl(null)
                .language(sourceLang)
                .sourceKey(sourceKey)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Transactional
    public TranslateResponse translateAndSave(TranslateRequest req) throws Exception {
        // 0) 입력 URL 정규화 + 제목 도출
        String inputUrl = normalizeInputFileUrl(req.getInputFileUrl());
        String storyTitle = resolveTitleFromUrl(inputUrl, req.getTitle());
        String sourceKey = buildSourceKey(inputUrl, req.getSourceLang());

        // 1) 원본 row 확보(초기 duration=null)
        Contents original = resolveOriginalContents(sourceKey, storyTitle, req.getSourceLang());

        // 2) Perso 프로젝트 생성(정확한 duration은 PersoClient에서 유효성 포함 전송)
        String uniqueTitleForPerso = storyTitle + "-" + System.currentTimeMillis();
        String inputName = FileStorage.sanitize(uniqueTitleForPerso) + ".mp4";
        Map<String, Object> project = perso.createProject(
                inputName, inputUrl, req.getSourceLang(),
                req.getDurationSec(), req.getNumberOfSpeakers());
        String projectId = getStr(project, "project_id");

        // 3) INITIAL_EXPORT 생성 후 완료 대기
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

        // 5) 실제 duration 산출(Export 완료 후 Perso가 채움)
        Map<String, Object> projectDetail = perso.getProject(projectId);
        Integer realDuration = getInt(projectDetail, "input_file_video_duration_sec");

        // 5-1) 여전히 null/1이면 스크립트의 max(end_ms)로 보정
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

        // 5-2) 그래도 없으면 요청값 사용(없으면 0)
        if (realDuration == null || realDuration <= 1) {
            realDuration = (req.getDurationSec() != null) ? req.getDurationSec() : 0;
        }

        // 6) 번역 비디오 저장(다운로드)
        String videoName = storyTitle + "_" + req.getTargetLang() + ".mp4";
        String savedVideoPath = storage.downloadToRoot(videoName, outUrl);

        // 6-1) 로컬 썸네일/동영상 탐색 (루트/부모 폴더 모두 시도)
        String localThumbPath = findLocalThumbPath(storyTitle);
        String publicThumbUrl = thumbnailUrlService.toPublicUrl(localThumbPath);
        String localVideoPath = findLocalVideoPath(storyTitle);

        // 7) DB 업데이트(원본은 "한 번만" 세팅될 값만 채움)
        boolean dirty = false;
        // duration 은 원본이 비어있을 때만 세팅 (이미 값 있으면 보존)
        if (original.getDurationSec() == null || original.getDurationSec() <= 1) {
            original.setDurationSec(realDuration);
            dirty = true;
        }
        if (publicThumbUrl != null && (original.getThumbUrl() == null || original.getThumbUrl().isBlank())) {
            original.setThumbUrl(publicThumbUrl);
            dirty = true;
        }
        if (localVideoPath != null && (original.getContentsPath() == null || original.getContentsPath().isBlank())) {
            original.setContentsPath(localVideoPath);
            dirty = true;
        }
        // sourceKey 는 resolveOriginalContents 에서 이미 보정함
        if (dirty) contentsRepo.save(original);

        // 8) 번역본 저장(부모-자식 연결)
        Contents translated = contentsRepo.save(Contents.builder()
                .parentId(original.getContentsId()) // 같은 동화의 번역본 관계
                .title(storyTitle)
                .thumbUrl(publicThumbUrl != null ? publicThumbUrl : original.getThumbUrl())
                .language(req.getTargetLang())
                .projectId(projectId)
                .exportId(exportId)
                .durationSec(realDuration)
                .contentsPath(savedVideoPath)
                .sourceKey(sourceKey)
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build());

        // 9) 스크립트 저장 (원문/번역문 1:1)
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

        log.info("✅ Saved video: {}", savedVideoPath);
        if (localThumbPath != null) log.info("🖼️  Saved thumbnail: {}", localThumbPath);
        if (localVideoPath != null) log.info("🎬  Local original video: {}", localVideoPath);

        return new TranslateResponse(
                translated.getContentsId(),
                translated.getProjectId(),
                translated.getExportId(),
                translated.getContentsPath());
    }
}
