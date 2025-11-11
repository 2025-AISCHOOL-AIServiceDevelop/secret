package com.aischool.controller;

import com.aischool.dto.ContentsGroupResponse;
import com.aischool.entity.Contents;
import com.aischool.repository.ContentsRepository;
import com.aischool.service.ContentsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentsController {

    private final ContentsRepository contentsRepository;
    private final ContentsService contentsService;

    @GetMapping("/search")
    public List<Contents> searchContents(@RequestParam("query") String query) {
        return contentsRepository.searchIgnoringSpaces(query); 
    }

    @GetMapping("/grouped-search")
    public List<ContentsGroupResponse> groupedSearch(@RequestParam("query") String query) {
        return contentsService.searchGrouped(query);
    }
}
