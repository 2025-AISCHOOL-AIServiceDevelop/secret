// src/main/java/com/aischool/service/FeedbackGenerator.java
package com.aischool.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class FeedbackGenerator {

    private final AzureResultAdapter adapter = new AzureResultAdapter();
    private final RuleEngine ruleEngine = new RuleEngine();
    private final FeedbackTemplates templates = new FeedbackTemplates();

    /**
     * aiResult: Azure 원시 JSON(String) 혹은 이미 CanonicalFeedbackInput
     */
    public GeneratedFeedbackResult generate(Object aiResult) {

        CanonicalFeedbackInput input;
        if (aiResult instanceof CanonicalFeedbackInput) {
            input = (CanonicalFeedbackInput) aiResult;
        } else if (aiResult instanceof String) {
            input = adapter.toCanonical((String) aiResult);
        } else {
            // 타입 예외: 기본값 리턴
            int fs = 80, acc = 80, flu = 80, comp = 80;
            return new GeneratedFeedbackResult(fs, acc, flu, comp, medalOf(fs),
                    "입력 형식을 확인해 주세요.");
        }

        // 룰 평가
        List<RuleIssue> issues = ruleEngine.evaluate(input);

        // 템플릿 합성 (톤은 우선 EMO로 고정; 필요 시 파라미터로 받기)
        String feedbackText = templates.compose(input, issues, FeedbackTemplates.Tone.EMO);

        int finalScore = (int) Math.round(input.finalScore);
        int accuracy    = (int) Math.round(input.accuracy);
        int fluency     = (int) Math.round(input.fluency);
        int completeness= (int) Math.round(input.completeness);

        return new GeneratedFeedbackResult(
                finalScore,
                accuracy,
                fluency,
                completeness,
                medalOf(finalScore),
                feedbackText
        );
    }

    private String medalOf(int finalScore) {
        if (finalScore >= 90) return "GOLD";
        if (finalScore >= 75) return "SILVER";
        return "BRONZE";
    }

    // ✅ 기존에 쓰던 간단 피드백 로직은 유지
    public String generateSimpleFeedback(double finalScore, double accuracy, double fluency, double completeness) {
        StringBuilder feedback = new StringBuilder();

        if (finalScore >= 85) {
            feedback.append("아주 잘했어요! ");
        } else if (finalScore >= 70) {
            feedback.append("좋아요! 조금만 더 연습해볼까요? ");
        } else {
            feedback.append("조금 더 또박또박 발음해보면 좋겠어요! ");
        }

        if (accuracy >= 85) feedback.append("정확도가 높아요! ");
        else feedback.append("단어 발음을 조금 더 정확히 해봐요. ");

        if (fluency >= 80) feedback.append("발음이 자연스럽네요! ");
        else feedback.append("조금 더 천천히 말하면 좋아요. ");

        if (completeness >= 80) feedback.append("전체적으로 완성도가 좋아요!");
        else feedback.append("끝까지 문장을 마무리해보세요!");

        return feedback.toString();
    }
}
