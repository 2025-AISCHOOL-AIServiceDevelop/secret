package com.aischool.service;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FeedbackGenerator {

    private final AzureResultAdapter adapter = new AzureResultAdapter();
    private final RuleEngine ruleEngine = new RuleEngine();

    // 영어 / 중국어 템플릿
    private final FeedbackTemplates enTemplates = new FeedbackTemplates();
    private final FeedbackTemplatesZh zhTemplates = new FeedbackTemplatesZh();

    /**
     * 언어별 세밀 발음 피드백 생성
     */
    public GeneratedFeedbackResult generate(Object aiResult, String lang) {

        CanonicalFeedbackInput input;
        if (aiResult instanceof CanonicalFeedbackInput) {
            input = (CanonicalFeedbackInput) aiResult;
        } else if (aiResult instanceof String) {
            input = adapter.toCanonical((String) aiResult);
        } else {
            int fs = 80, acc = 80, flu = 80, comp = 80;
            return new GeneratedFeedbackResult(
                    fs, acc, flu, comp, medalOf(fs),
                    "입력 형식을 확인해 주세요."
            );
        }

        // 룰엔진으로 이슈 목록 생성
        List<RuleIssue> issues = ruleEngine.evaluate(input);

        // 언어별 템플릿 선택
        FeedbackTemplatesBase template = resolveTemplate(lang);

        // 템플릿에 이슈 목록을 넘겨서 최종 피드백 문장 생성
        String feedbackText = template.compose(input, issues);

        int finalScore     = (int) Math.round(input.finalScore);
        int accuracy       = (int) Math.round(input.accuracy);
        int fluency        = (int) Math.round(input.fluency);
        int completeness   = (int) Math.round(input.completeness);

        return new GeneratedFeedbackResult(
                finalScore,
                accuracy,
                fluency,
                completeness,
                medalOf(finalScore),
                feedbackText
        );
    }

    // 기존 generate(Object) 호출은 영어 기본
    public GeneratedFeedbackResult generate(Object aiResult) {
        return generate(aiResult, "en");
    }

    private FeedbackTemplatesBase resolveTemplate(String lang) {
        if (lang == null) return enTemplates;

        switch (lang.toLowerCase()) {
            case "zh":
            case "zh-cn":
                return zhTemplates;
            case "en":
            default:
                return enTemplates;
        }
    }

    private String medalOf(int finalScore) {
        if (finalScore >= 90) return "GOLD";
        if (finalScore >= 75) return "SILVER";
        return "BRONZE";
    }
}
