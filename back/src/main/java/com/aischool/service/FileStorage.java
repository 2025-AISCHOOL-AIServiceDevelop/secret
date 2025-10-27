package com.aischool.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileStorage {

    @Value("${storage.root-dir}")
    private String rootDir;

    /** 루트 폴더에 바로 파일 저장 (하위 폴더 생성 안 함) */
    public String downloadToRoot(String fileName, String fileUrl) throws Exception {
        File root = new File(rootDir);
        if (!root.exists() && !root.mkdirs()) {
            throw new IllegalStateException("Cannot create storage root: " + root.getAbsolutePath());
        }

        // 같은 이름이 이미 있으면 -1, -2 … 붙여 충돌 방지
        File dest = new File(root, fileName);
        if (dest.exists()) {
            int dot = fileName.lastIndexOf('.');
            String base = (dot > 0) ? fileName.substring(0, dot) : fileName;
            String ext  = (dot > 0) ? fileName.substring(dot) : "";
            int i = 1;
            File alt;
            do {
                alt = new File(root, base + "-" + i + ext);
                i++;
            } while (alt.exists());
            dest = alt;
        }

        FileUtils.copyURLToFile(new URL(fileUrl), dest, 30_000, 120_000);
        return dest.getAbsolutePath();
    }

    /** 파일명에 사용할 수 없는 문자 정리 */
    public static String sanitize(String name) {
        String s = name == null ? "" : name;
        s = s.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        // 제어문자 제거
        s = s.replaceAll("[\\p{Cntrl}]", "");
        if (s.isBlank()) s = "untitled_" + UUID.randomUUID().toString().substring(0, 8);
        // 윈도우 금지 예약어 회피(CON, PRN, AUX, NUL, COM1.., LPT1..)
        if (s.matches("(?i)^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$")) {
            s = "_" + s;
        }
        // 너무 긴 경우 잘라내기(기본 120)
        if (s.length() > 120) s = s.substring(0, 120);
        return s;
    }
}
