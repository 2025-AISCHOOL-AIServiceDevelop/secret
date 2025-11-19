// src/main/java/com/aischool/service/AzureResultAdapter.java
package com.aischool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AzureResultAdapter {

    private final ObjectMapper om = new ObjectMapper();

    public CanonicalFeedbackInput toCanonical(String azureJson) {
        CanonicalFeedbackInput out = new CanonicalFeedbackInput();

        try {
            JsonNode root = om.readTree(azureJson);

            JsonNode nbest0 = (root.has("NBest")) ? root.get("NBest").get(0) : null;
            if (nbest0 == null) return out;

            JsonNode pa = nbest0.get("PronunciationAssessment");
            out.accuracy = getDouble(pa, "AccuracyScore", 0);
            out.fluency = getDouble(pa, "FluencyScore", 0);
            out.completeness = getDouble(pa, "CompletenessScore", 0);
            out.finalScore = out.accuracy;

            JsonNode words = nbest0.get("Words");
            if (words == null || !words.isArray()) return out;

            for (JsonNode w : words) {
                CanonicalFeedbackInput.WordFeedback wf = new CanonicalFeedbackInput.WordFeedback();

                wf.text = getText(w, "Word", "word", "");
                wf.accuracy = getDouble(w.get("PronunciationAssessment"), "AccuracyScore", 0);

                JsonNode phs = w.get("Phonemes");
                if (phs != null && phs.isArray()) {

                    int idx = 0;
                    int last = phs.size() - 1;

                    for (JsonNode p : phs) {
                        CanonicalFeedbackInput.PhonemeFeedback pf = new CanonicalFeedbackInput.PhonemeFeedback();

                        pf.symbol = getText(p, "Phoneme", "phoneme", "");
                        pf.accuracy = getDouble(p.get("PronunciationAssessment"), "AccuracyScore", 0);
                        pf.errorType = getText(p.get("PronunciationAssessment"), "ErrorType", "errorType", "");
                        pf.wordFinal = (idx == last);

                        wf.phonemes.add(pf);
                        idx++;
                    }
                }

                out.words.add(wf);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return out;
    }

    private double getDouble(JsonNode node, String key, double def) {
        if (node == null) return def;
        JsonNode v = node.get(key);
        if (v == null) return def;
        return v.asDouble(def);
    }

    private String getText(JsonNode n, String k1, String k2, String def) {
        if (n == null) return def;
        if (n.has(k1)) return n.get(k1).asText(def);
        if (n.has(k2)) return n.get(k2).asText(def);
        return def;
    }
}
