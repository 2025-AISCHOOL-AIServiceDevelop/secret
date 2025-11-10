// src/main/java/com/aischool/service/FeedbackTemplates.java
package com.aischool.service;

import java.util.List;
import java.util.Random;

public class FeedbackTemplates {

    public enum Tone { EMO, PLAIN, CUTE, FUN }

    private final Random rnd = new Random();

    public String compose(CanonicalFeedbackInput in, List<RuleIssue> issues, Tone tone) {
        StringBuilder sb = new StringBuilder();

        // 칭찬
        sb.append(praise(in, tone)).append(" ");

        // 핵심 코칭들
        for (int i = 0; i < issues.size(); i++) {
            sb.append(coreTip(issues.get(i), tone)).append(" ");
        }

        // 미니연습
        sb.append(miniPractice(issues, tone)).append(" ");

        // 격려
        sb.append(encourage(tone));

        return sb.toString().trim();
    }

    private String praise(CanonicalFeedbackInput in, Tone t) {
        if (in.finalScore >= 85) {
            return pick(t,
                    "아주 잘했어요! ",
                    "전체적으로 좋습니다. ",
                    "대박! 진짜 잘했어! ",
                    "스멜~ 나는 실력! 좋았어! ");
        } else if (in.finalScore >= 70) {
            return pick(t,
                    "좋아요! ",
                    "무난합니다. ",
                    "오! 괜찮아! ",
                    "출발 좋았어! ");
        } else {
            return pick(t,
                    "차근차근 연습해보자! ",
                    "보완해봅시다. ",
                    "우리 천천히 가자! ",
                    "업그레이드 타임! ");
        }
    }

    private String coreTip(RuleIssue issue, Tone t) {
        switch (issue.category) {
            case COMPLETENESS:
                return pick(t,
                        "이번엔 문장을 처음부터 끝까지 또박또박 말해볼까요?",
                        "문장을 끝까지 발화하도록 신경 쓰세요.",
                        "끝까지 다 말해보자!",
                        "엔딩까지 GO! 빠진 단어 없이~");
            case FLUENCY:
                return pick(t,
                        "숨을 한 번 크게 쉬고, 두 덩어리로 나눠 천천히 말해봐요.",
                        "호흡을 정리하고 속도를 약간 낮추세요.",
                        "후~ 숨 고르고 천천히!",
                        "빠른 손은 금물! 살짝만 느리게~");
            case PHONEME:
                return phonemeTip(issue.detail, issue.code, t);
            default:
                return "";
        }
    }

    private String phonemeTip(String phoneme, String code, Tone t) {
        switch (phoneme) {
            case "r":
                return pick(t,
                        "R은 혀끝이 윗잇몸에 닿지 않게, 입술을 동그랗게 말아 ‘으-r’ 느낌으로 소리내보아요.",
                        "R은 혀끝 비접촉, 입술 원순화로 발성하세요.",
                        "R은 혀 안 닿게~ 입술 동그랗게! ‘으r’!",
                        "R은 ‘으r’! 혀끝 노터치, 입술 뿅!");
            case "l":
                return pick(t,
                        "L은 혀끝을 윗잇몸 뒤에 가볍게 톡 대며 마무리해요.",
                        "L은 치경 뒤 접촉으로 클로저를 분명히.",
                        "L은 혀끝 톡! 끝에서 살포시!",
                        "L은 라스트에 탁! 혀끝으로 마감!");
            case "s":
                if (code.contains("warn") || code.contains("strong")) {
                    return pick(t,
                            "S 가 약해요. 앞니 사이를 살짝 벌리고 바람 ‘스-’를 먼저 내 본 뒤 단어에 붙여요.",
                            "S는 무성 마찰음. 치간 협착으로 바람 위주 발성.",
                            "S는 ‘스-’ 먼저! 그다음 단어!",
                            "S는 바람소리! ‘스-’로 스타트!");
                }
                break;
            case "ʃ":
                return pick(t,
                        "SH는 입술을 살짝 내밀고 혀 중간을 올려 ‘쉬-’처럼 길게 내보아요.",
                        "ʃ는 원순화+설배 상승. 지속 마찰을 확보하세요.",
                        "SH는 ‘쉬-’로 길게!",
                        "SH는 입술 앞으로~ ‘쉬-’!");
            case "tʃ":
                return pick(t,
                        "CH는 /t/+ʃ 결합, 치조 뒤에서 짧게 터뜨리듯 시작해요.",
                        "tʃ는 폐쇄-마찰 연속. 초반 클로저를 분명히.",
                        "CH는 ‘츄’ 말고 짧게 ‘치!’",
                        "CH는 탁! 치고 마찰!");
            case "θ":
                return pick(t,
                        "무성 TH는 윗니와 아랫니 사이로 혀끝을 살짝 내밀고 바람만 내보아요.",
                        "θ는 치간 마찰, 성대 무진동으로.",
                        "TH(θ)는 혀끝 살짝 내밀고 바람만!",
                        "θ는 바람만~ 목소리 OFF!");
            case "ð":
                return pick(t,
                        "유성 TH는 위치는 같고, 목소리를 켜서 ‘ð’로 시작해요.",
                        "ð는 치간 마찰, 성대 진동 포함.",
                        "TH(ð)는 목소리 ON!",
                        "ð는 ‘드’ 말고 성대 울림~");
            case "v":
                return pick(t,
                        "V는 아랫입술을 윗니에 가볍게 대고 바람+목소리를 함께 내요.",
                        "v는 순치 마찰+유성. 성대 진동 확인.",
                        "V는 입술-윗니! ‘v-’로 시작!",
                        "V는 바람+목소리 동시출격!");
            case "f":
                return pick(t,
                        "F는 V와 같지만 목소리는 끄고 바람만 내요.",
                        "f는 순치 마찰 무성. 성대 OFF.",
                        "F는 바람만! ‘f-’!",
                        "F는 무성~ 바람만~");
            case "z":
                return pick(t,
                        "Z는 S처럼 바람을 내되, 목소리를 켜서 내요.",
                        "z는 치간 마찰 유성. 성대 진동 포함.",
                        "Z는 ‘즈-’! 목소리 ON!",
                        "Z는 S+목소리! ‘즈-’!");
        }
        return pick(t, "발음을 조금 더 또박또박 해봐요.", "발성 위치와 방법을 명확히 하세요.", "조금만 또렷하게!", "발성 포지션 체크!");
    }

    private String miniPractice(List<RuleIssue> issues, Tone t) {
        return pick(t,
                "연습: 입모양 3회 → 단어 2개 → 문장 1회!",
                "루틴: 조형 3회 → 최소단어 2회 → 전체문장 1회.",
                "미션: 포즈 3번! 단어 2번! 문장 1번!",
                "퀵미션: 모양-단어-문장 순서로 한 번 더!");
    }

    private String encourage(Tone t) {
        return pick(t,
                "아주 좋아요. 한 번만 더 해볼까요?",
                "좋습니다. 다음 시도에서 개선해봅시다.",
                "너무 잘했어! 한 번만 더!",
                "좋았어~ 다음 판 간다!");
    }

    private String pick(Tone t, String emo, String plain, String cute, String fun) {
        switch (t) {
            case EMO: return emo;
            case PLAIN: return plain;
            case CUTE: return cute;
            case FUN: return fun;
            default: return plain;
        }
    }
}
