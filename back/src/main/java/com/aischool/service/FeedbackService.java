package com.aischool.service;

import com.aischool.entity.Feedback;
import com.aischool.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;

    public Feedback saveFeedback(Long userId,
                                 Long contentsId,
                                 String lang,
                                 int finalScore,
                                 int accuracy,
                                 int fluency,
                                 int completeness,
                                 String medal,
                                 String text) {

        Feedback feedback = Feedback.builder()
                .userId(userId)
                .contentsId(contentsId)
                .lang(lang)
                .finalScore(finalScore)
                .accuracy(accuracy)
                .fluency(fluency)
                .completeness(completeness)
                .medal(Feedback.Medal.valueOf(medal))
                .feedbackText(text)
                .feedbackDate(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }

   
}
