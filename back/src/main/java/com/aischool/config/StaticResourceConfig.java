package com.aischool.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${storage.root-dir}")
    private String storageRootDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path thumbnailDir = Paths.get(storageRootDir, "thumbnail")
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(thumbnailDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot initialize thumbnail directory: " + thumbnailDir, e);
        }

        registry.addResourceHandler("/static/thumbnails/**")
                .addResourceLocations(thumbnailDir.toUri().toString());
    }
}
