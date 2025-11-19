package com.aischool.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class FeedbackGenerator {

    private final AzureResultAdapter adapter = new AzureResultAdapter();
    private final RuleEngine ruleEngine = new RuleEngine();

    private final FeedbackTemplatesBase enTemplates = new FeedbackTemplates();
    private final FeedbackTemplatesBase zhTemplates = new FeedbackTemplatesZh();

    public GeneratedFeedbackResult generate(Object aiResult, String lang) {

        CanonicalFeedbackInput input;
        if (aiResult instanceof CanonicalFeedbackInput) {
            input = (CanonicalFeedbackInput) aiResult;
        } else if (aiResult instanceof String) {
            input = adapter.toCanonical((String) aiResult);
        } else {
            return new GeneratedFeedbackResult(
                    0, 0, 0, 0, "BRONZE",
                    "입력 형식을 확인해 주세요."
            );
        }

        List<RuleIssue> issues = ruleEngine.evaluate(input);
        FeedbackTemplatesBase template = resolveTemplate(lang);

        String detailText = template.compose(input, issues);

        int finalScore = (int) Math.round(input.finalScore);

        String finalFeedback = buildFinalFeedback(finalScore, detailText);

        return new GeneratedFeedbackResult(
                finalScore,
                (int) input.accuracy,
                (int) input.fluency,
                (int) input.completeness,
                medalOf(finalScore),
                finalFeedback
        );
    }

    private FeedbackTemplatesBase resolveTemplate(String lang) {
        if (lang == null) return enTemplates;

        return switch (lang.toLowerCase()) {
            case "zh", "zh-cn" -> zhTemplates;
            default -> enTemplates;
        };
    }

    private String medalOf(int score) {
        if (score >= 90) return "GOLD";
        if (score >= 75) return "SILVER";
        return "BRONZE";
    }

    /** 점수 기반 피드백 톤 조절 */
 
/** 점수 기반 피드백 톤 조절 (민지 최종 개선본) */
private String buildFinalFeedback(int finalScore, String detailText) {

    // detailText 전처리 (불필요한 공백, 줄바꿈 제거)
    detailText = (detailText == null) ? "" : detailText.trim();
    boolean hasDetail = !detailText.isEmpty();

    // --- BRONZE (0 ~ 74) ---
    if (finalScore < 75) {
        if (hasDetail) {
            return detailText + "\n우리 같이 조금 더 연습해볼까?";
        }
        return "괜찮아! 천천히 더 연습해보자! 조금씩 좋아지고 있어!";
    }

    // --- SILVER (75 ~ 89) ---
    if (finalScore < 90) {
        if (hasDetail) {
            return detailText + "\n조금만 더 연습하면 훨씬 좋아질 거예요!";
        }
        return "좋아요! 거의 다 왔어요! 조금만 더 힘내요!";
    }

    // --- GOLD (90 ~ 100) ---
    if (hasDetail) {
        return detailText + "\n아주 잘했어요! 거의 완벽해요!";
    }

    return "정말 잘했어요! 발음이 많이 좋아졌어요!";
}


}
