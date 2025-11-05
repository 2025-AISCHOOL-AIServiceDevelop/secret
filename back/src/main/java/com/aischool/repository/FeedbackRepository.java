package com.aischool.repository;
// CRUD 기능을 자동 제공하는 인터페이스 

import com.aischool.entity.Feedback;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // 사용자별 조회용 
    List<Feedback> findByUserId(Long userId);
}
