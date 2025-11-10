package com.aischool.controller;

import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.dto.ContentsDetailResponse;
import com.aischool.entity.Contents;
import com.aischool.entity.Script;
import com.aischool.repository.ContentsRepository;
import com.aischool.repository.ScriptRepository;
import com.aischool.service.TranslationService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/translate")
public class TranslationController {

    private final TranslationService service;
    private final ScriptRepository scriptRepo;
    private final ContentsRepository contentsRepo; 

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

     /** 3) 단일 콘텐츠(영상) 상세 */
    @GetMapping("/{contentsId}")
    public ResponseEntity<ContentsDetailResponse> getContents(@PathVariable Integer contentsId) {
        Contents contents = contentsRepo.findById(contentsId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ContentsDetailResponse.from(contents));
    }
}
