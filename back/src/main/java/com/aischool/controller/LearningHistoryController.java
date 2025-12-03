package com.aischool.controller;

import com.aischool.dto.LearningHistoryRequest;
import com.aischool.dto.LearningHistoryResponse;
import com.aischool.service.LearningHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@Slf4j
public class LearningHistoryController {

    private final LearningHistoryService historyService;

    // ★ 학습 기록 저장 (언어 포함해서 DTO로 전달됨)
    @PostMapping
    public ResponseEntity<Void> save(@RequestBody LearningHistoryRequest req,
                                     HttpSession session) {

        Long userId = (Long) session.getAttribute("loginUserId");
        String sessionId = session.getId();

        log.info("POST /api/history called. sessionId={}, loginUserId={}, lang={}",
                sessionId, userId, req.getLanguage());

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        historyService.saveOrUpdate(userId, req);
        return ResponseEntity.ok().build();
    }

    // ★ 내 학습 기록 조회 (언어별)
    @GetMapping("/me")
    public ResponseEntity<List<LearningHistoryResponse>> myHistory(
            @RequestParam("lang") String language,   // ?lang=en 같은 쿼리 파라미터
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("loginUserId");
        String sessionId = session.getId();

        log.info("GET /api/history/me called. sessionId={}, loginUserId={}, lang={}",
                sessionId, userId, language);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<LearningHistoryResponse> data = historyService.getMyHistory(userId, language);
        return ResponseEntity.ok(data);
    }
}
