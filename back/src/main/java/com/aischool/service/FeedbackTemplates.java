package com.aischool.service;

import java.util.*;
import java.util.stream.Collectors;

public class FeedbackTemplates implements FeedbackTemplatesBase {

    // PHONEME detail → 아이용 피드백 문장
    private static final Map<String, String> PHONEME_TIPS;
    static {
        Map<String, String> m = new HashMap<>();
        m.put("r",  "r 소리는 혀끝이 윗잇몸에 닿지 않게, 살짝 띄워서 소리 내보자!");
        m.put("l",  "l 소리는 혀끝을 윗잇몸 뒤에 톡 대면 더 또렷해져!");
        m.put("s",  "s 소리는 바람이 먼저 ‘스-’ 하고 나가면 더 잘 돼!");
        m.put("ʃ",  "sh 소리는 입술을 조금 내밀고 ‘쉬~’처럼 부드럽게 말해봐!");
        m.put("tʃ", "ch 소리는 ‘치!’처럼 짧고 또렷하게 시작하면 좋아!");
        m.put("θ",  "무성 th(θ)는 혀를 살짝 내밀고 바람만 ‘th~’ 내보자!");
        m.put("ð",  "유성 th(ð)는 혀는 같고, 목소리를 켜서 ‘드~’처럼 살짝 울려줘!");
        m.put("v",  "v 소리는 아랫입술을 윗니에 대고 ‘브~’ 소리가 나게 해봐!");
        m.put("f",  "f 소리는 입술에 힘 빼고 바람만 ‘프~’ 하고 내보자!");
        m.put("z",  "z 소리는 s와 비슷하지만 목소리를 켜서 ‘즈~’라고 해보자!");
        PHONEME_TIPS = Collections.unmodifiableMap(m);
    }

    @Override
    public String compose(CanonicalFeedbackInput in, List<RuleIssue> issues) {

        // 1) PHONEME 이슈만 모아서 최대 2개만 사용
        List<RuleIssue> phonemeIssues = issues.stream()
                .filter(i -> i.category == RuleIssue.Category.PHONEME)
                .limit(2)
                .collect(Collectors.toList());

        // 2) PHONEME 이슈가 하나도 없으면 → 완벽한 발음이라고 판단
        if (phonemeIssues.isEmpty()) {
            return perfectPraise();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("아주 잘했어요! 여기만 조금 더 고쳐보자!\n");

        for (RuleIssue issue : phonemeIssues) {
            String key = issue.detail;  // ex) "r", "s", "θ" 등
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
        return "와! 발음이 정말 완벽해요! 지금처럼만 하면 돼!";
    }
}
