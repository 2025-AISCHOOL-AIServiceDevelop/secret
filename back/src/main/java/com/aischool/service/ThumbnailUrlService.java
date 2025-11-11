package com.aischool.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ThumbnailUrlService {

    private final Path thumbnailRoot;
    private final String publicBaseUrl;

    public ThumbnailUrlService(
            @Value("${storage.root-dir}") String storageRootDir,
            @Value("${thumbnail.public-base-url:http://localhost:8082/static/thumbnails}") String thumbnailBaseUrl
    ) {
        this.thumbnailRoot = Paths.get(storageRootDir, "thumbnail")
                .toAbsolutePath()
                .normalize();

        this.publicBaseUrl = thumbnailBaseUrl.endsWith("/")
                ? thumbnailBaseUrl.substring(0, thumbnailBaseUrl.length() - 1)
                : thumbnailBaseUrl;
    }

    public boolean needsConversion(String value) {
        if (value == null || value.isBlank()) return false;
        if (isHttpUrl(value)) return false;
        // Windows local path heuristic (e.g., C:\ or \\)
        return value.contains(":\\") || value.startsWith("\\\\") || value.startsWith("/");
    }

    public String toPublicUrl(String pathOrUrl) {
        if (pathOrUrl == null || pathOrUrl.isBlank()) {
            return pathOrUrl;
        }

        if (!needsConversion(pathOrUrl)) {
            return pathOrUrl;
        }

        try {
            Path absolute = Paths.get(pathOrUrl)
                    .toAbsolutePath()
                    .normalize();

            String relative = null;
            if (absolute.startsWith(thumbnailRoot)) {
                relative = thumbnailRoot.relativize(absolute)
                        .toString()
                        .replace('\\', '/');
            } else {
                relative = extractRelativeFromString(pathOrUrl);
            }

            if (relative == null || relative.isBlank()) {
                return pathOrUrl;
            }

            String encoded = encodePath(relative);
            return publicBaseUrl + "/" + encoded;
        } catch (Exception e) {
            log.warn("Failed to convert thumbnail path '{}' to public URL", pathOrUrl, e);
            return pathOrUrl;
        }
    }

    private String extractRelativeFromString(String raw) {
        String normalized = raw.replace('\\', '/');
        String marker = "/contents/thumbnail/";
        int idx = normalized.toLowerCase(Locale.ROOT).indexOf(marker);
        if (idx == -1) {
            return null;
        }
        String candidate = normalized.substring(idx + marker.length());
        return candidate.isBlank() ? null : candidate;
    }

    private String encodePath(String relativePath) {
        return Arrays.stream(relativePath.split("/"))
                .filter(segment -> !segment.isBlank())
                .map(segment -> UriUtils.encodePathSegment(segment, StandardCharsets.UTF_8))
                .collect(Collectors.joining("/"));
    }

    private boolean isHttpUrl(String value) {
        String lower = value.toLowerCase(Locale.ROOT);
        return lower.startsWith("http://") || lower.startsWith("https://");
    }
}
