package com.aischool.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "script",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_script_line_lang", columnNames = {"contents_id", "order_no", "language"})
    },
    indexes = {
        @Index(name = "idx_script_contents_lang", columnList = "contents_id, language"),
        @Index(name = "idx_script_contents_order", columnList = "contents_id, order_no")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Script {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "script_id")
    private Integer scriptId;

    @Column(name = "contents_id", nullable = false)
    private Integer contentsId;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Column(name = "start_ms", nullable = false)
    private Integer startMs;

    @Column(name = "end_ms", nullable = false)
    private Integer endMs;

    // ✅ 행 당 1개 언어의 문장
    @Column(name = "language", length = 8, nullable = false)
    private String language; // 예: "ko","en","ja","zh","fr","es","de"

    @Lob
    @Column(name = "text")
    private String text;

    // (호환용) 기존 컬럼 유지하고 싶으면 남겨두기 — 이후 제거 가능
    // @Lob @Column(name = "text_org") private String textOrg;
    // @Lob @Column(name = "text_tr")  private String textTr;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
