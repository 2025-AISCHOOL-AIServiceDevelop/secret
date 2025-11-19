package com.aischool.service;

import java.util.*;
import java.util.stream.Collectors;

public class FeedbackTemplatesZh implements FeedbackTemplatesBase {

    private static final Map<String, String> PHONEME_TIPS;
    static {
        Map<String, String> m = new HashMap<>();
        m.put("zh", "zh 소리는 혀를 살짝 말아서 ‘즈’처럼 말해보자!");
        m.put("ch", "ch는 바람을 조금 더 세게, ‘츠!’처럼 힘 있게!");
        m.put("sh", "sh는 혀를 뒤로 살짝 당기고 ‘쉬~’처럼 부드럽게 해봐!");
        m.put("r",  "중국어 r 소리는 더 부드럽게, 살살 굴려서 말해보자!");
        m.put("ü",  "ü는 입술을 앞으로 동그랗게 모으고 ‘이’처럼 소리 내봐!");
        m.put("j",  "j는 ‘지’와 비슷하지만 입을 너무 크게 벌리지 않기!");
        m.put("q",  "q는 숨을 살짝 섞어서 ‘치~’처럼 가볍게!");
        m.put("x",  "x는 ‘시’처럼 들리지만 혀를 조금 더 뒤로 당겨서!");
        PHONEME_TIPS = Collections.unmodifiableMap(m);
    }

    @Override
    public String compose(CanonicalFeedbackInput in, List<RuleIssue> issues) {

        List<RuleIssue> phonemeIssues = issues.stream()
                .filter(i -> i.category == RuleIssue.Category.PHONEME)
                .collect(Collectors.toList());

        if (phonemeIssues.isEmpty()) return "";

        StringBuilder sb = new StringBuilder("정말 잘했어요! 여기만 조금 더 고쳐보면 더 예쁜 발음이에요!\n");

        for (RuleIssue issue : phonemeIssues) {
            String key = issue.detail;
            String tip = PHONEME_TIPS.getOrDefault(
                    key,
                    "조금만 더 또박또박 발음하면 더 좋아질 거예요!"
            );
            sb.append("- ").append(tip).append("\n");
        }

        return sb.toString().trim();
    }

    @Override
    public String perfectPraise() {
        return "아주 잘했어요! 발음이 정말 예쁘게 들려요!";
    }
}
