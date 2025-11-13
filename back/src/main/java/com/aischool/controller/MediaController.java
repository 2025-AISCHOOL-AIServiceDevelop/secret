package com.aischool.controller;

import com.aischool.entity.Contents;
import com.aischool.repository.ContentsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final ContentsRepository contentsRepo;

    @GetMapping("/{contentsId}")
    public ResponseEntity<Resource> stream(@PathVariable Integer contentsId) throws IOException {
        Contents contents = contentsRepo.findById(contentsId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contents not found"));

        String storedPath = contents.getContentsPath();
        Path filePath = null;
        
        // 1) 현재 콘텐츠의 동영상 경로 확인
        if (storedPath != null && !storedPath.isBlank()) {
            filePath = Paths.get(storedPath);
        }

        // 2) 파일이 없고 원본 콘텐츠(parentId=null)인 경우, 첫 번째 번역본의 비디오 사용
        if ((filePath == null || !Files.exists(filePath)) && contents.getParentId() == null) {
            log.info("Original content {} has no video, checking translations...", contentsId);
            var translations = contentsRepo.findByParentId(contentsId);
            for (Contents translation : translations) {
                String transPath = translation.getContentsPath();
                if (transPath != null && !transPath.isBlank()) {
                    Path transFilePath = Paths.get(transPath);
                    if (Files.exists(transFilePath) && Files.isRegularFile(transFilePath)) {
                        log.info("Using video from translation: contentsId={}", translation.getContentsId());
                        filePath = transFilePath;
                        break;
                    }
                }
            }
        }

        // 3) 최종 파일 존재 여부 확인
        if (filePath == null || !Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            log.warn("Video file not found for contentsId={}, path={}", contentsId, storedPath);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video file not found");
        }

        FileSystemResource resource = new FileSystemResource(filePath);
        MediaType mediaType = detectMediaType(filePath);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(Files.size(filePath))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                .body(resource);
    }

    private MediaType detectMediaType(Path filePath) {
        try {
            String type = Files.probeContentType(filePath);
            if (type != null) {
                return MediaType.parseMediaType(type);
            }
        } catch (Exception ignore) {
            // fallback below
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
