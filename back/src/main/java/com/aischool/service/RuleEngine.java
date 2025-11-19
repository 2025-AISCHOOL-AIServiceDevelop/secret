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
         * 1) 완전성(Completeness) 체크
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
         * 2) 유창성(Fluency) 체크
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
         * 3) 음소별(Phoneme) 문제 탐지
         * ============================= */
        Map<String, List<Double>> byPhoneme = new HashMap<>();
        Map<String, Integer> endOfWordCount = new HashMap<>();

        for (CanonicalFeedbackInput.WordFeedback w : in.words) {
            for (CanonicalFeedbackInput.PhonemeFeedback p : w.phonemes) {
                if (p.symbol == null || p.symbol.isEmpty()) continue;

                // phoneme accuracy 추가
                byPhoneme.computeIfAbsent(p.symbol, k -> new ArrayList<>()).add(p.accuracy);

                // 단어 마지막 음절 여부 count
                if (p.wordFinal) {
                    endOfWordCount.put(
                            p.symbol,
                            endOfWordCount.getOrDefault(p.symbol, 0) + 1
                    );
                }
            }
        }

        for (Map.Entry<String, List<Double>> entry : byPhoneme.entrySet()) {
            String symbol = entry.getKey();
            List<Double> scores = entry.getValue();

            double avg = scores.stream()
                    .mapToDouble(d -> d)
                    .average()
                    .orElse(100.0);

            /* ============================================================
             * 🔥 핵심 수정 포인트: Azure가 phoneme accuracy 를 제공하지 않아
             * score = 0 인 경우가 있음 → 이런 경우는 문제로 취급하지 않음.
             * ============================================================ */
            if (avg == 0) {
                continue; // accuracy 정보 없음 → skip
            }

            /* ============================================================
             * 음소 정확도가 임계값 이하인 경우만 문제로 간주
             * ============================================================ */
            if (avg < PHONEME_WARN) {
                boolean isCore = CORE_PHONEMES.contains(symbol);
                int finals = endOfWordCount.getOrDefault(symbol, 0);

                // impact 계산: 코어음소 가산 + 낮은 점수 가산 + 등장 빈도 + 말음 빈도
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
         * 4) impact 순으로 정렬 후 상위 2개만 선택
         * ============================= */
        return issues.stream()
                .sorted(Comparator
                        .comparingDouble((RuleIssue r) -> r.impact)
                        .reversed())
                .limit(2)
                .collect(Collectors.toList());
    }
}
