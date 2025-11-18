package com.aischool.repository;

import com.aischool.entity.LearningHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningHistoryRepository extends JpaRepository<LearningHistory, Long> {

    Optional<LearningHistory> findByUserIdAndContentsId(Long userId, Long contentsId);


    List<LearningHistory> findByUserIdOrderByUpdatedAtDesc(Long userId);
}


