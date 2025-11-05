package com.aischool.service;

import com.aischool.entity.Feedback;
import com.aischool.entity.Feedback.Medal;
import com.aischool.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public Feedback saveFeedback(
            Long userId,
            Long contentsId,
            String lang,
            double finalScore,
            double accuracy,
            double fluency,
            double completeness,
            String medal,
            String feedbackText
    ) {
        Feedback feedback = Feedback.builder()
                .userId(userId)
                .contentsId(contentsId)
                .lang(lang)
                .finalScore((int) Math.round(finalScore))
                .accuracy((int) Math.round(accuracy))
                .fluency((int) Math.round(fluency))
                .completeness((int) Math.round(completeness))
                .medal(Medal.valueOf(medal))
                .feedbackText(feedbackText)
                .feedbackDate(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }
}
