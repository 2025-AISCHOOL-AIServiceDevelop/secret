package com.aischool.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URL;
import java.nio.charset.StandardCharsets; // (필요 시 유지)
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileStorage {

    @Value("${storage.root-dir}")
    private String rootDir;

    /** 공용: 디렉터리 보장 생성 */
    private File ensureDir(File dir) {
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IllegalStateException("Cannot create directory: " + dir.getAbsolutePath());
        }
        return dir;
    }

    /** 공용: 동일 파일명 충돌 시 -1, -2 … 붙여서 고유 파일 생성 */
    private File uniqueDest(File dir, String fileName) {
        String safe = sanitize(fileName);
        File dest = new File(dir, safe);
        if (!dest.exists()) return dest;

        int dot = safe.lastIndexOf('.');
        String base = (dot > 0) ? safe.substring(0, dot) : safe;
        String ext  = (dot > 0) ? safe.substring(dot) : "";
        int i = 1;
        File alt;
        do {
            alt = new File(dir, base + "-" + i + ext);
            i++;
        } while (alt.exists());
        return alt;
    }

    /** ⬇️ 루트 바로 아래에 저장 (하위 폴더 X) */
    public String downloadToRoot(String fileName, String fileUrl) throws Exception {
        File root = ensureDir(new File(rootDir));
        File dest = uniqueDest(root, fileName);
        FileUtils.copyURLToFile(new URL(fileUrl), dest, 30_000, 120_000);
        return dest.getAbsolutePath();
    }

    /** ⬇️ 지정한 서브폴더에 저장 (예: subDir="contents") */
    public String downloadTo(String subDir, String fileName, String fileUrl) throws Exception {
        File base = (subDir == null || subDir.isBlank())
                ? new File(rootDir)
                : new File(rootDir, subDir);
        ensureDir(base);

        File dest = uniqueDest(base, fileName);
        FileUtils.copyURLToFile(new URL(fileUrl), dest, 30_000, 120_000);
        return dest.getAbsolutePath();
    }

    /** 파일명에 사용할 수 없는 문자 정리 */
    public static String sanitize(String name) {
        String s = (name == null) ? "" : name;
        // 기본 금지 문자 치환
        s = s.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        // 제어문자 제거
        s = s.replaceAll("[\\p{Cntrl}]", "");
        if (s.isBlank()) s = "untitled_" + UUID.randomUUID().toString().substring(0, 8);
        // Windows 예약어 회피
        if (s.matches("(?i)^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$")) {
            s = "_" + s;
        }
        // 너무 길면 자르기
        if (s.length() > 120) s = s.substring(0, 120);
        return s;
    }
}
