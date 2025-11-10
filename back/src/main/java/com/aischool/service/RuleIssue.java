// src/main/java/com/aischool/service/RuleIssue.java
package com.aischool.service;

public class RuleIssue {
    public enum Category { PHONEME, COMPLETENESS, FLUENCY }
    public final Category category;
    public final String code;   // 예: "phoneme_r_low", "completeness_low" ...
    public final String detail; // 예: 대상 음소나 단어 등
    public final double impact; // 우선순위 계산 점수

    public RuleIssue(Category category, String code, String detail, double impact) {
        this.category = category;
        this.code = code;
        this.detail = detail;
        this.impact = impact;
    }
}
