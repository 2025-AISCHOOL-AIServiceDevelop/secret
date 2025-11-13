package com.aischool.controller;

import com.aischool.dto.ContentsDetailResponse;
import com.aischool.dto.TranslateRequest;
import com.aischool.dto.TranslateResponse;
import com.aischool.entity.Contents;
import com.aischool.entity.Script;
import com.aischool.repository.ContentsRepository;
import com.aischool.repository.ScriptRepository;
import com.aischool.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/translate")
public class TranslationController {

    private final TranslationService service;
    private final ScriptRepository scriptRepo;
    private final ContentsRepository contentsRepo;

    /** 1) 번역 작업 요청부터 완료까지 일괄 수행 */
    @PostMapping
    public ResponseEntity<TranslateResponse> translate(@RequestBody TranslateRequest req) throws Exception {
        TranslateResponse res = service.translateAndSave(req);
        return ResponseEntity.ok(res);
    }

    /** 2) 저장된 스크립트 조회 */
    @GetMapping("/{contentsId}/scripts")
    public ResponseEntity<List<Script>> scripts(
            @PathVariable Integer contentsId,
            @RequestParam(value = "lang", required = false) String language
    ) {
        Contents contents = contentsRepo.findById(contentsId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contents not found"));

        // 요청 언어 정규화 (없으면 콘텐츠의 언어 사용)
        String normalizedLang = normalizeLanguage(language)
                .or(() -> normalizeLanguage(contents.getLanguage()))
                .orElse(null);

        List<Script> scripts;
        
        // 1) 먼저 현재 contentsId로 스크립트 조회
        if (normalizedLang == null) {
            scripts = scriptRepo.findByContentsIdOrderByOrderNoAsc(contentsId);
        } else {
            scripts = scriptRepo.findByContentsIdAndLanguageOrderByOrderNoAsc(contentsId, normalizedLang);
        }

        // 2) 스크립트가 없고, 이 콘텐츠가 원본(parentId=null)이면 첫 번째 번역본에서 찾기
        if (scripts.isEmpty() && contents.getParentId() == null) {
            List<Contents> translations = contentsRepo.findByParentId(contentsId);
            if (!translations.isEmpty()) {
                Contents firstTranslation = translations.get(0);
                if (normalizedLang == null) {
                    scripts = scriptRepo.findByContentsIdOrderByOrderNoAsc(firstTranslation.getContentsId());
                } else {
                    scripts = scriptRepo.findByContentsIdAndLanguageOrderByOrderNoAsc(
                            firstTranslation.getContentsId(), normalizedLang);
                }
            }
        }

        // 3) 여전히 없으면 언어 필터 없이 재시도
        if (scripts.isEmpty() && normalizedLang != null) {
            scripts = scriptRepo.findByContentsIdOrderByOrderNoAsc(contentsId);
        }

        return ResponseEntity.ok(scripts);
    }

    /** 3) 단일 콘텐츠(원본/번역) 상세 */
    @GetMapping("/{contentsId}")
    public ResponseEntity<ContentsDetailResponse> getContents(@PathVariable Integer contentsId) {
        Contents contents = contentsRepo.findById(contentsId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ContentsDetailResponse.from(contents));
    }

    private Optional<String> normalizeLanguage(String value) {
        if (value == null) return Optional.empty();
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return Optional.empty();
        return Optional.of(trimmed.toLowerCase(Locale.ROOT));
    }
}
