package com.aischool.repository;

import com.aischool.entity.Contents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ContentsRepository extends JpaRepository<Contents, Integer> {

    // 🔍 기본 검색 (기존 기능 유지)
    List<Contents> findByTitleContainingIgnoreCase(String keyword);

    // ✅ 띄어쓰기 무시 검색 (콩쥐팥쥐 → 콩쥐 팥쥐 매칭)
    @Query("""
        SELECT c
        FROM Contents c
        WHERE LOWER(REPLACE(c.title, ' ', '')) LIKE LOWER(CONCAT('%', REPLACE(:query, ' ', ''), '%'))
    """)
    List<Contents> searchIgnoringSpaces(@Param("query") String query);

    Optional<Contents> findFirstBySourceKeyAndParentIdIsNull(String sourceKey);

    Optional<Contents> findFirstByTitleIgnoreCaseAndLanguageAndParentIdIsNull(String title, String language);

    List<Contents> findByParentIdIn(Collection<Integer> parentIds);

    List<Contents> findByParentId(Integer parentId);

    List<Contents> findByContentsIdIn(Collection<Integer> ids);
}
