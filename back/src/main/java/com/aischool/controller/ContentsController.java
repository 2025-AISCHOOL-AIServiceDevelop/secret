package com.aischool.controller;

import com.aischool.entity.Contents;
import com.aischool.repository.ContentsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentsController {

    private final ContentsRepository contentsRepository;

    // 🔍 제목 검색 API (띄어쓰기 무시 포함)
    @GetMapping("/search")
    public List<Contents> searchContents(@RequestParam("query") String query) {
        return contentsRepository.searchIgnoringSpaces(query);  // ✅ 변경
    }
}
