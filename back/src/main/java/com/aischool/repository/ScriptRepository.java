package com.aischool.repository;

import com.aischool.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScriptRepository extends JpaRepository<Script, Integer> {
    List<Script> findByContentsIdOrderByOrderNoAsc(Integer contentsId);
}
