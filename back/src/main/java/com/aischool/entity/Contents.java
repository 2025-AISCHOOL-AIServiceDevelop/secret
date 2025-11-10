package com.aischool.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contents")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Contents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contents_id")
    private Integer contentsId;

    // 원본이면 NULL, 번역본이면 원본 contents_id
    @Column(name = "parent_id")
    private Integer parentId;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(name = "thumb_url", length = 512)
    private String thumbUrl;

    // ISO 언어코드 (예: ko, en, ja)
    @Column(length = 8, nullable = false)
    private String language;

    @Column(name = "duration_sec")
    private Integer durationSec;

    @Column(name = "project_id", length = 64)
    private String projectId;

    @Column(name = "export_id", length = 64)
    private String exportId;

    // 로컬 저장 경로(완료된 번역 영상 파일 경로)
    @Column(name = "contents_path", length = 500)
    private String contentsPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "source_key", length = 128)
    private String sourceKey;
}
