package com.aischool.repository;

import com.aischool.entity.LearningHistory;
import com.aischool.repository.LearningHistoryWithContentsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LearningHistoryRepository extends JpaRepository<LearningHistory, Long> {

    // 🔹 단일 콘텐츠에 대한 기록 조회 (언어까지 포함)
    Optional<LearningHistory> findByUserIdAndContentsIdAndLanguage(
            Long userId,
            Long contentsId,
            String language
    );

    // 🔹 특정 유저의 모든 기록 최신순
    List<LearningHistory> findByUserIdOrderByUpdatedAtDesc(Long userId);


    // 🔹 언어 상관없이 모든 기록 + 콘텐츠 정보 JOIN
    @Query("""
        select 
            h.id               as id,
            h.contentsId       as contentsId,
            h.progressSec      as progressSec,
            h.totalSec         as totalSec,
            h.lastLineIdx      as lastLineIdx,
            h.updatedAt        as updatedAt,
            c.title            as title,
            c.thumbUrl         as thumbUrl,
            c.contentsPath     as contentsPath,
            c.durationSec      as durationSec,
            c.language         as language
        from LearningHistory h
        join Contents c
            on h.contentsId = c.contentsId
        where h.userId = :userId
        order by h.updatedAt desc
        """)
    List<LearningHistoryWithContentsProjection> findDetailedByUserIdOrderByUpdatedAtDesc(
            @Param("userId") Long userId
    );


    // 🔥 신규 추가: 특정 언어 기준으로 최신순 조회 (프론트에서 lang=ko/en/zh 보낼 때)
    @Query("""
        select 
            h.id               as id,
            h.contentsId       as contentsId,
            h.progressSec      as progressSec,
            h.totalSec         as totalSec,
            h.lastLineIdx      as lastLineIdx,
            h.updatedAt        as updatedAt,
            c.title            as title,
            c.thumbUrl         as thumbUrl,
            c.contentsPath     as contentsPath,
            c.durationSec      as durationSec,
            c.language         as language
        from LearningHistory h
        join Contents c
            on h.contentsId = c.contentsId
        where h.userId = :userId
          and c.language = :language
        order by h.updatedAt desc
        """)
    List<LearningHistoryWithContentsProjection> findDetailedByUserIdAndLanguageOrderByUpdatedAtDesc(
            @Param("userId") Long userId,
            @Param("language") String language
    );
}
