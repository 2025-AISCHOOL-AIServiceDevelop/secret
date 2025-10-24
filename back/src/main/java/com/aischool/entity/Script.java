package com.aischool.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "script")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Script {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "script_id")
    private Integer scriptId;

    @Column(name = "contents_id", nullable = false)
    private Integer contentsId;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Column(name = "start_ms")
    private Integer startMs;

    @Column(name = "end_ms")
    private Integer endMs;

    @Lob
    @Column(name = "text_org", columnDefinition = "LONGTEXT")
    private String textOrg;

    @Lob
    @Column(name = "text_tr", columnDefinition = "LONGTEXT")
    private String textTr;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
