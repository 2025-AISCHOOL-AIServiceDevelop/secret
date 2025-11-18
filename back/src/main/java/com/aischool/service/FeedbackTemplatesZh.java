package com.aischool.service;

import java.util.*;
import java.util.stream.Collectors;

public class FeedbackTemplatesZh implements FeedbackTemplatesBase {

    // 중국어 PHONEME detail → 아이용 피드백 문장
    private static final Map<String, String> PHONEME_TIPS;
    static {
        Map<String, String> m = new HashMap<>();
        m.put("zh", "zh 소리는 혀를 살짝 말아서 ‘즈’처럼 말해보자!");
        m.put("ch", "ch는 바람을 조금 더 세게, ‘츠!’처럼 힘 있게 내봐!");
        m.put("sh", "sh는 혀를 뒤로 살짝 당기고 ‘쉬~’처럼 부드럽게 말하면 좋아!");
        m.put("r",  "중국어 r 소리는 ‘르’보다 더 부드럽게, 살살 굴려서 말해보자!");
        m.put("ü",  "ü는 입술을 앞으로 동그랗게 모으고 ‘이’처럼 소리 내보자!");
        m.put("j",  "j 소리는 ‘지’랑 비슷하지만 입을 너무 크게 벌리지 말고 말해봐!");
        m.put("q",  "q 소리는 숨을 살짝 섞어서 ‘치~’처럼 가볍게 말해보자!");
        m.put("x",  "x 소리는 ‘시’처럼 들리지만 혀를 조금 더 뒤로 당겨서 말해봐!");
        PHONEME_TIPS = Collections.unmodifiableMap(m);
    }

    @Override
    public String compose(CanonicalFeedbackInput in, List<RuleIssue> issues) {

        List<RuleIssue> phonemeIssues = issues.stream()
                .filter(i -> i.category == RuleIssue.Category.PHONEME)
                .limit(2)
                .collect(Collectors.toList());

        if (phonemeIssues.isEmpty()) {
            return perfectPraise();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("정말 잘했어요! 여기만 살짝 더 고치면 더 예쁜 발음이 돼요.\n");

        for (RuleIssue issue : phonemeIssues) {
            String key = issue.detail;  // ex) "zh", "ch", "sh", "ü" 등
            String tip = PHONEME_TIPS.getOrDefault(
                    key,
                    "조금만 더 또박또박 발음해보자!"
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
