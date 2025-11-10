// src/main/java/com/aischool/service/CanonicalFeedbackInput.java
package com.aischool.service;

import java.util.ArrayList;
import java.util.List;

public class CanonicalFeedbackInput {
    public double finalScore;
    public double accuracy;
    public double fluency;
    public double completeness;

    public List<WordFeedback> words = new ArrayList<>();

    public static class WordFeedback {
        public String text;
        public double accuracy;
        public long startMs;
        public long endMs;
        public long trailingSilenceMs;
        public String errorType; // Correct, Omission, Insertion, Mispronunciation

        public List<PhonemeFeedback> phonemes = new ArrayList<>();
    }

    public static class PhonemeFeedback {
        public String symbol; // e.g., r, l, s, ʃ, tʃ, θ, ð, v, f, z ...
        public double accuracy;
        public String errorType; // Omission, Substitution, Insertion, Correct
        public boolean wordFinal;
    }
}
