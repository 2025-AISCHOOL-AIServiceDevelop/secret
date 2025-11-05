package com.aischool.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // feedbackId가 자동 증가
    private Long feedbackId;

    private Long userId;
    private Long contentsId;
    private String lang;
    private int finalScore;
private Integer accuracy;      // 정확도
private Integer fluency;       // 유창성
private Integer completeness;  // 완성도


    @Enumerated(EnumType.STRING)
    private Medal medal;

    private String feedbackText;
    private LocalDateTime feedbackDate;

    public enum Medal {
        GOLD, SILVER, BRONZE
    }
}
