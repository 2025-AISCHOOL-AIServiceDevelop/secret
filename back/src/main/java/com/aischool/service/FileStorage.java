package com.aischool.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URL;
import java.nio.charset.StandardCharsets; // (?�요 ???��?)
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileStorage {

    @Value("${storage.root-dir}")
    private String rootDir;

    /** 공용: ?�렉?�리 보장 ?�성 */
    private File ensureDir(File dir) {
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IllegalStateException("Cannot create directory: " + dir.getAbsolutePath());
        }
        return dir;
    }

    /** 공용: ?�일 ?�일�?충돌 ??-1, -2 ??붙여??고유 ?�일 ?�성 */
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

    /** ⬇️ 루트 바로 ?�래???�??(?�위 ?�더 X) */
    public String downloadToRoot(String fileName, String fileUrl) throws Exception {
        File root = ensureDir(new File(rootDir));
        File dest = uniqueDest(root, fileName);
        FileUtils.copyURLToFile(new URL(fileUrl), dest, 30_000, 120_000);
        return buildPublicPath(null, dest);
    }

    /** ⬇️ 지?�한 ?�브?�더???�??(?? subDir="contents") */
    public String downloadTo(String subDir, String fileName, String fileUrl) throws Exception {
        File base = (subDir == null || subDir.isBlank())
                ? new File(rootDir)
                : new File(rootDir, subDir);
        ensureDir(base);

        File dest = uniqueDest(base, fileName);
        FileUtils.copyURLToFile(new URL(fileUrl), dest, 30_000, 120_000);
        return buildPublicPath(subDir, dest);
    }

    /**
     * 저장된 실제 파일 경로를 서비스에서 노출할 형태(상대/절대 문자열)로 변환
     */
    private String buildPublicPath(String subDir, File dest) {
        Path base = Paths.get(rootDir);
        if (subDir != null && !subDir.isBlank()) {
            base = base.resolve(subDir);
        }
        Path logical = base.resolve(dest.getName()).normalize();
        String result = logical.toString().replace("\\", "/");
        if (!logical.isAbsolute()
                && !result.startsWith("./")
                && !result.startsWith("../")) {
            result = "./" + result;
        }
        return result;
    }

    /** ?�일명에 ?�용?????�는 문자 ?�리 */
    public static String sanitize(String name) {
        String s = (name == null) ? "" : name;
        // 기본 금�? 문자 치환
        s = s.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        // ?�어문자 ?�거
        s = s.replaceAll("[\\p{Cntrl}]", "");
        if (s.isBlank()) s = "untitled_" + UUID.randomUUID().toString().substring(0, 8);
        // Windows ?�약???�피
        if (s.matches("(?i)^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$")) {
            s = "_" + s;
        }
        // ?�무 길면 ?�르�?
        if (s.length() > 120) s = s.substring(0, 120);
        return s;
    }
}
