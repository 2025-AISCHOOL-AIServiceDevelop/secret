// src/main/java/com/aischool/service/AzureResultAdapter.java
package com.aischool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Iterator;

public class AzureResultAdapter {

    private final ObjectMapper om = new ObjectMapper();

    /**
     * @param azureJson Azure Speech Pronunciation Assessment 원시 JSON 문자열
     * @return CanonicalFeedbackInput (내부 공통 스키마)
     */
    public CanonicalFeedbackInput toCanonical(String azureJson) {
        CanonicalFeedbackInput out = new CanonicalFeedbackInput();
        try {
            JsonNode root = om.readTree(azureJson);

            // Utterance-level (NBest[0] 기준)
            JsonNode nbest0 = null;
            if (root.has("NBest") && root.get("NBest").isArray() && root.get("NBest").size() > 0) {
                nbest0 = root.get("NBest").get(0);
            } else if (root.has("nBest")) {
                // 혹시 케이스가 다르면 보정
                nbest0 = root.get("nBest").get(0);
            }

            if (nbest0 != null) {
                JsonNode pa = nbest0.get("PronunciationAssessment");
                if (pa == null) pa = nbest0.get("pronunciationAssessment");
                out.accuracy = getDouble(pa, "AccuracyScore", 0);
                out.fluency = getDouble(pa, "FluencyScore", 0);
                out.completeness = getDouble(pa, "CompletenessScore", 0);
                // Azure에 FinalScore가 따로 없을 수 있으니 평균/가중합으로 근사
                out.finalScore = weighted(out.accuracy, out.fluency, out.completeness);

                // Words
                JsonNode words = nbest0.get("Words");
                if (words == null) words = nbest0.get("words");
                if (words != null && words.isArray()) {
                    for (JsonNode w : words) {
                        CanonicalFeedbackInput.WordFeedback wf = new CanonicalFeedbackInput.WordFeedback();
                        wf.text = getText(w, "Word", "word", "");
                        wf.accuracy = getDouble(w, "AccuracyScore", 0);
                        wf.startMs = (long) (getDouble(w, "Offset", 0) / 10000.0); // ticks → ms 근사
                        wf.endMs = wf.startMs + (long) (getDouble(w, "Duration", 0) / 10000.0);
                        wf.trailingSilenceMs = (long) getDouble(w, "TrailingSilence", 0);
                        wf.errorType = getText(w, "ErrorType", "errorType", "Correct");

                        // Phonemes
                        JsonNode phs = w.get("Phonemes");
                        if (phs == null) phs = w.get("phonemes");
                        if (phs != null && phs.isArray()) {
                            Iterator<JsonNode> it = phs.elements();
                            int idx = 0;
                            int lastIdx = phs.size() - 1;
                            while (it.hasNext()) {
                                JsonNode p = it.next();
                                CanonicalFeedbackInput.PhonemeFeedback pf = new CanonicalFeedbackInput.PhonemeFeedback();
                                pf.symbol = getText(p, "Phoneme", "phoneme", "");
                                if (pf.symbol.isEmpty()) pf.symbol = getText(p, "Symbol", "symbol", "");
                                pf.accuracy = getDouble(p, "AccuracyScore", getDouble(p, "score", 0));
                                pf.errorType = getText(p, "ErrorType", "errorType", "Correct");
                                pf.wordFinal = (idx == lastIdx);
                                wf.phonemes.add(pf);
                                idx++;
                            }
                        }
                        out.words.add(wf);
                    }
                }
            }

        } catch (Exception e) {
            // 실패 시 기본값 리턴 (서비스 죽지 않도록)
        }
        return out;
    }

    private double weighted(double acc, double flu, double comp) {
        // 가중치 예: 정확도 0.45 / 유창성 0.25 / 완전성 0.30
        return Math.round((acc * 0.45 + flu * 0.25 + comp * 0.30));
    }

    private String getText(JsonNode node, String k1, String k2, String def) {
        if (node == null) return def;
        if (node.has(k1) && node.get(k1).isTextual()) return node.get(k1).asText();
        if (node.has(k2) && node.get(k2).isTextual()) return node.get(k2).asText();
        return def;
        }

    private double getDouble(JsonNode node, String key, double def) {
        if (node == null) return def;
        JsonNode v = node.get(key);
        if (v == null) return def;
        if (v.isNumber()) return v.asDouble();
        if (v.isTextual()) {
            try { return Double.parseDouble(v.asText()); } catch (Exception ignored) {}
        }
        return def;
    }
}
