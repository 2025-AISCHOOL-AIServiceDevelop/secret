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
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    private Long userId;
    private Long contentsId;
    private String lang;
    private int finalScore;
    private int accuracy;
    private int fluency;
    private int completeness;

    @Enumerated(EnumType.STRING)
    private Medal medal;

    private String feedbackText;
    private LocalDateTime feedbackDate;

    public enum Medal {
        GOLD, SILVER, BRONZE
    }
}
