package com.aischool.repository;

import com.aischool.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScriptRepository extends JpaRepository<Script, Integer> {

    // ✅ 특정 콘텐츠의 전체 스크립트 (언어 구분 없이)
    List<Script> findByContentsIdOrderByOrderNoAsc(Integer contentsId);

    // ✅ 특정 언어로 필터링 (예: 한글/영어 등)
    List<Script> findByContentsIdAndLanguageOrderByOrderNoAsc(Integer contentsId, String language);
}
