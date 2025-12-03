package com.aischool.util;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;

/**
 * 공용 경로 정규화 유틸.
 * contents_path 컬럼에는 항상 ./contents/... 형태를 저장한다.
 */
public final class ContentsPathUtil {

    private ContentsPathUtil() {
    }

    public static String normalize(Path path) {
        return normalize(path == null ? null : path.toString());
    }

    public static String normalize(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return null;

        String path = trimmed.replace("\\", "/");
        path = path.replaceAll("/{2,}", "/");

        int idx = path.toLowerCase(Locale.ROOT).lastIndexOf("/contents/");
        if (idx >= 0) {
            path = "." + path.substring(idx);
        } else {
            path = relativizeIfPossible(path);
        }

        if (!path.startsWith("./") && !path.startsWith("../")) {
            if (path.startsWith("/")) {
                path = "." + path;
            } else {
                path = "./" + path;
            }
        }
        return path;
    }

    private static String relativizeIfPossible(String path) {
        try {
            Path abs = Paths.get(path);
            if (!abs.isAbsolute()) {
                return path;
            }
            Path cwd = Paths.get("").toAbsolutePath().normalize();
            Path relative = cwd.relativize(abs.normalize());
            return relative.toString().replace("\\", "/");
        } catch (Exception ignore) {
            return path;
        }
    }
}
