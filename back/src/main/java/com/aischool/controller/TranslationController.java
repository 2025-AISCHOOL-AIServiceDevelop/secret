package com.aischool.controller;

import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.entity.Script;
import com.aischool.repository.ScriptRepository;
import com.aischool.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/translate")
public class TranslationController {

    private final TranslationService service;
    private final ScriptRepository scriptRepo;

    /** 1) 번역 시작 → 저장까지 일괄 수행 */
    @PostMapping
    public ResponseEntity<TranslateResponse> translate(@RequestBody TranslateRequest req) throws Exception {
        TranslateResponse res = service.translateAndSave(req);
        return ResponseEntity.ok(res);
    }

    /** 2) 저장된 스크립트 조회 */
    @GetMapping("/{contentsId}/scripts")
    public ResponseEntity<List<Script>> scripts(@PathVariable Integer contentsId) {
        return ResponseEntity.ok(scriptRepo.findByContentsIdOrderByOrderNoAsc(contentsId));
    }
}
