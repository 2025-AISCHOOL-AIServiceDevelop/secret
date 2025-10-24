package com.aischool.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.*;

@Component
@RequiredArgsConstructor
public class FileStorage {

    @Value("${storage.root-dir}")
    private String rootDir;

    public String downloadTo(String subDir, String filename, String fileUrl) throws IOException {
        Path dir = Path.of(rootDir, subDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);

        Path target = dir.resolve(filename);
        try (InputStream in = new URL(fileUrl).openStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return target.toString();
    }
}
