// src/main/java/com/aischool/service/RuleEngine.java
package com.aischool.service;

import java.util.*;
import java.util.stream.Collectors;

public class RuleEngine {

    // 임계값
    private static final double PHONEME_WARN = 80.0;
    private static final double PHONEME_STRONG = 65.0;
    private static final double COMPLETENESS_WARN = 85.0;
    private static final double FLUENCY_WARN = 75.0;

    private static final Set<String> CORE_PHONEMES = new HashSet<>(Arrays.asList("r","l","s","ʃ","tʃ","θ","ð","v","f","z"));

    public List<RuleIssue> evaluate(CanonicalFeedbackInput in) {
        List<RuleIssue> issues = new ArrayList<>();

        // 완전성
        if (in.completeness < COMPLETENESS_WARN) {
            double impact = 100 + (COMPLETENESS_WARN - in.completeness);
            issues.add(new RuleIssue(RuleIssue.Category.COMPLETENESS, "completeness_low", "", impact));
        }

        // 유창성
        if (in.fluency < FLUENCY_WARN) {
            double impact = 60 + (FLUENCY_WARN - in.fluency);
            issues.add(new RuleIssue(RuleIssue.Category.FLUENCY, "fluency_low", "", impact));
        }

        // 음소별
        Map<String, List<Double>> byPhoneme = new HashMap<>();
        Map<String, Integer> endOfWordCount = new HashMap<>();

        for (CanonicalFeedbackInput.WordFeedback w : in.words) {
            for (CanonicalFeedbackInput.PhonemeFeedback p : w.phonemes) {
                if (p.symbol == null || p.symbol.isEmpty()) continue;
                String sym = p.symbol;
                byPhoneme.computeIfAbsent(sym, k -> new ArrayList<>()).add(p.accuracy);
                if (p.wordFinal) endOfWordCount.put(sym, endOfWordCount.getOrDefault(sym, 0) + 1);
            }
        }

        for (Map.Entry<String, List<Double>> e : byPhoneme.entrySet()) {
            String sym = e.getKey();
            double avg = e.getValue().stream().mapToDouble(d -> d).average().orElse(100.0);

            if (avg < PHONEME_WARN) {
                boolean core = CORE_PHONEMES.contains(sym);
                int finals = endOfWordCount.getOrDefault(sym, 0);
                // impact: 코어음소 가산 + 말음 가산 + 낮은 점수 가산 + 빈도 보너스
                double impact = (core ? 40 : 20) + Math.max(0, (PHONEME_WARN - avg)) + (finals * 2) + e.getValue().size();
                String code = "phoneme_" + sym + (avg < PHONEME_STRONG ? "_strong" : "_warn");
                issues.add(new RuleIssue(RuleIssue.Category.PHONEME, code, sym, impact));
            }
        }

        // 우선순위 정렬 & 상위 2개만 리턴
        return issues.stream()
                .sorted(Comparator.comparingDouble((RuleIssue r) -> r.impact).reversed())
                .limit(2)
                .collect(Collectors.toList());
    }
}
