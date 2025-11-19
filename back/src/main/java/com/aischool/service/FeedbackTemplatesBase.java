// src/main/java/com/aischool/service/FeedbackTemplatesBase.java
package com.aischool.service;

import java.util.List;

public interface FeedbackTemplatesBase {

    /**
     * RuleEngine에서 나온 이슈 목록을 기반으로
     * 언어별 세밀 피드백 문자열을 만든다.
     */
    String compose(CanonicalFeedbackInput in, List<RuleIssue> issues);

    /**
     * 세밀 피드백이 필요 없을 정도로 좋을 때(= PHONEME 이슈 없음) 쓰는 칭찬 문장
     */
    String perfectPraise();
}
