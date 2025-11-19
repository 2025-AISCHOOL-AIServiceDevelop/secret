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

        // 1) 룰엔진 이슈 추출
        List<RuleIssue> issues = ruleEngine.evaluate(input);

        // 2) 언어별 템플릿 가져오기
        FeedbackTemplatesBase template = resolveTemplate(lang);

        // 3) 세밀 피드백 생성 (detailText 역할)
        String detailBlock = template.compose(input, issues).trim();

        // 4) 점수 계산
        int finalScore = (int) Math.round(input.finalScore);

        // 5) 최종 피드백 문장 생성
        String finalFeedback = buildFinalFeedback(finalScore, detailBlock);

        // 6) 최종 결과 객체 (detailText 제거)
        return new GeneratedFeedbackResult(
                finalScore,
                (int) input.accuracy,
                (int) input.fluency,
                (int) input.completeness,
                medalOf(finalScore),
                finalFeedback  // detail 미사용 → feedbackText 하나만 보냄
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

    /**
     * detail + 점수기반 멘트를 자연스럽게 하나로 조합
     * 중복 제거됨 / detail 없어도 자연스럽게 동작
     */
    private String buildFinalFeedback(int score, String detail) {

        boolean hasDetail = (detail != null && !detail.isBlank());
        StringBuilder out = new StringBuilder();

        // --- 1) 세밀피드백(detail) 먼저 추가 ---
        if (hasDetail) {
            out.append(detail).append("\n");
        }

        // --- 2) 점수 완성 멘트 ---
        if (score < 75) {   // BRONZE
            if (hasDetail) {
                out.append("우리 같이 조금 더 연습해볼까?");
            } else {
                out.append("괜찮아! 천천히 더 연습해보자! 조금씩 좋아지고 있어!");
            }
        }
        else if (score < 90) { // SILVER
            if (hasDetail) {
                out.append("조금만 더 연습하면 훨씬 좋아질 거예요!");
            } else {
                out.append("좋아요! 거의 다 왔어요! 조금만 더 힘내요!");
            }
        }
        else { // GOLD
            if (hasDetail) {
                out.append("아주 잘했어요! 거의 완벽해요!");
            } else {
                out.append("정말 잘했어요! 발음이 많이 좋아졌어요!");
            }
        }

        return out.toString().trim();
    }
}
