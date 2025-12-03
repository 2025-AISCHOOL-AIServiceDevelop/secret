package com.aischool.repository;

import java.time.LocalDateTime;

public interface LearningHistoryWithContentsProjection {

    // LearningHistory 쪽
    Long getId();
    Long getContentsId();
    Integer getProgressSec();
    Integer getTotalSec();
    Integer getLastLineIdx();
    LocalDateTime getUpdatedAt();

    // Contents 쪽
    String getTitle();
    String getThumbUrl();
    String getContentsPath();
    Integer getDurationSec();
    String getLanguage();
}
