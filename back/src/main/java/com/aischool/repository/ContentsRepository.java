package com.aischool.repository;

import com.aischool.entity.Contents;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentsRepository extends JpaRepository<Contents, Integer> {
    // 🔍 제목(title)에 검색어가 포함된 콘텐츠 조회
    List<Contents> findByTitleContainingIgnoreCase(String keyword);
}
