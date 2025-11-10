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
        if (storedPath == null || storedPath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video file not prepared yet");
        }

        Path filePath = Paths.get(storedPath);
        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            log.warn("Requested video file missing. id={}, path={}", contentsId, storedPath);
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
