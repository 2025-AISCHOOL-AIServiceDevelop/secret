package com.aischool.service;

import java.util.*;
import java.util.stream.Collectors;

public class FeedbackTemplates implements FeedbackTemplatesBase {

    private static final Map<String, String> PHONEME_TIPS;
    static {
        Map<String, String> m = new HashMap<>();
        m.put("r",  "r 소리는 혀끝이 윗잇몸에 닿지 않게, 살짝 띄워서 소리 내보자!");
        m.put("l",  "l 소리는 혀끝을 윗잇몸 뒤에 톡 대면 또렷해져!");
        m.put("s",  "s 소리는 바람이 먼저 ‘스-’ 하고 나가면 더 잘 돼!");
        m.put("ʃ",  "sh 소리는 입술을 조금 내밀고 ‘쉬~’처럼 부드럽게!");
        m.put("tʃ", "ch 소리는 ‘치!’처럼 짧고 또렷하게!");
        m.put("θ",  "무성 th(θ)는 혀를 살짝 내밀고 바람만 ‘th~’ 내보자!");
        m.put("ð",  "유성 th(ð)는 목소리를 살짝 켜서 ‘드~’처럼 울려줘!");
        m.put("v",  "v 소리는 아랫입술을 윗니에 대고 ‘브~’ 해보자!");
        m.put("f",  "f 소리는 입술 힘을 빼고 바람만 ‘프~’ 내보자!");
        m.put("z",  "z 소리는 s와 비슷하지만 목소리를 켜서 ‘즈~’라고 해봐!");
        PHONEME_TIPS = Collections.unmodifiableMap(m);
    }

    @Override
    public String compose(CanonicalFeedbackInput in, List<RuleIssue> issues) {

        List<RuleIssue> phonemeIssues = issues.stream()
                .filter(i -> i.category == RuleIssue.Category.PHONEME)
                .collect(Collectors.toList());

        if (phonemeIssues.isEmpty()) return "";

        StringBuilder sb = new StringBuilder("아주 잘했어요! 여기만 조금 더 고쳐보자!\n");

        for (RuleIssue issue : phonemeIssues) {
            String key = issue.detail;
            String tip = PHONEME_TIPS.getOrDefault(
                    key,
                    "조금만 더 또박또박 말해보면 더 좋아질 거야!"
            );
            sb.append("- ").append(tip).append("\n");
        }

        return sb.toString().trim();
    }

    @Override
    public String perfectPraise() {
        return "정말 멋져요! 발음이 너무 좋아서 선생님도 깜짝 놀랐어요!";
    }
}
