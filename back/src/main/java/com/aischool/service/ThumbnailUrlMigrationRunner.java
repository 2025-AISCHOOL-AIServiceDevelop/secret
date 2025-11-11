package com.aischool.service;

import com.aischool.entity.Contents;
import com.aischool.repository.ContentsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ThumbnailUrlMigrationRunner implements ApplicationRunner {

    private final ContentsRepository contentsRepository;
    private final ThumbnailUrlService thumbnailUrlService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Contents> candidates = contentsRepository.findAll();
        List<Contents> dirty = new ArrayList<>();

        for (Contents contents : candidates) {
            String original = contents.getThumbUrl();
            String converted = thumbnailUrlService.toPublicUrl(original);
            if (converted != null && !converted.equals(original)) {
                contents.setThumbUrl(converted);
                dirty.add(contents);
            }
        }

        if (!dirty.isEmpty()) {
            contentsRepository.saveAll(dirty);
            log.info("Migrated {} thumbnail URL(s) to public paths.", dirty.size());
        } else {
            log.info("Thumbnail URL migration skipped – no legacy paths detected.");
        }
    }
}
