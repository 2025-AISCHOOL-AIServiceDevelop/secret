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

    private static final Set<String> CORE_PHONEMES = new HashSet<>(
            Arrays.asList("r", "l", "s", "ʃ", "tʃ", "θ", "ð", "v", "f", "z")
    );

    public List<RuleIssue> evaluate(CanonicalFeedbackInput in) {
        List<RuleIssue> issues = new ArrayList<>();

        /* =============================
         * 1) 완전성(Completeness)
         * ============================= */
        if (in.completeness < COMPLETENESS_WARN) {
            double impact = 100 + (COMPLETENESS_WARN - in.completeness);
            issues.add(new RuleIssue(
                    RuleIssue.Category.COMPLETENESS,
                    "completeness_low",
                    "",
                    impact
            ));
        }

        /* =============================
         * 2) 유창성(Fluency)
         * ============================= */
        if (in.fluency < FLUENCY_WARN) {
            double impact = 60 + (FLUENCY_WARN - in.fluency);
            issues.add(new RuleIssue(
                    RuleIssue.Category.FLUENCY,
                    "fluency_low",
                    "",
                    impact
            ));
        }

        /* =============================
         * 3) 음소별 문제 탐지
         * ============================= */
        Map<String, List<Double>> byPhoneme = new HashMap<>();
        Map<String, Integer> endOfWordCount = new HashMap<>();

        for (CanonicalFeedbackInput.WordFeedback w : in.words) {
            for (CanonicalFeedbackInput.PhonemeFeedback p : w.phonemes) {

                if (p.symbol == null || p.symbol.isEmpty()) continue;

                byPhoneme.computeIfAbsent(p.symbol, k -> new ArrayList<>())
                        .add(p.accuracy);

                if (p.wordFinal) {
                    endOfWordCount.put(
                            p.symbol,
                            endOfWordCount.getOrDefault(p.symbol, 0) + 1
                    );
                }
            }
        }

        for (String symbol : byPhoneme.keySet()) {
            List<Double> scores = byPhoneme.get(symbol);

            double avg = scores.stream()
                    .mapToDouble(d -> d)
                    .average()
                    .orElse(100.0);

            // accuracy=0 이면 errorType 기반으로 판단
            if (avg == 0) {
                boolean hasError = in.words.stream().anyMatch(w ->
                        w.phonemes.stream().anyMatch(p ->
                                p.symbol.equals(symbol) &&
                                !"Correct".equalsIgnoreCase(p.errorType)
                        )
                );
                if (!hasError) continue;
                avg = 50;
            }

            if (avg < PHONEME_WARN) {
                boolean isCore = CORE_PHONEMES.contains(symbol);
                int finals = endOfWordCount.getOrDefault(symbol, 0);

                double impact =
                        (isCore ? 40 : 20)
                                + Math.max(0, PHONEME_WARN - avg)
                                + finals * 2
                                + scores.size();

                String code = "phoneme_" + symbol +
                        (avg < PHONEME_STRONG ? "_strong" : "_warn");

                issues.add(new RuleIssue(
                        RuleIssue.Category.PHONEME,
                        code,
                        symbol,
                        impact
                ));
            }
        }

        /* =============================
         * 4) 상위 2개 이슈만 선택
         * ============================= */
        return issues.stream()
                .sorted(Comparator.comparingDouble((RuleIssue r) -> r.impact).reversed())
                .limit(2)
                .collect(Collectors.toList());
    }
}
