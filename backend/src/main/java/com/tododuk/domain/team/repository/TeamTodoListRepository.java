package com.tododuk.domain.team.repository;

import com.tododuk.domain.team.entity.TeamTodoList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamTodoListRepository extends JpaRepository<TeamTodoList, Long> {
    
    // 팀별 할일 목록 조회
    List<TeamTodoList> findByTeamIdOrderByCreateDateDesc(Long teamId);
    
    // 사용자별 할일 목록 조회 (개인 할일)
    List<TeamTodoList> findByUserIdOrderByCreateDateDesc(Long userId);
    
    // 팀과 사용자로 할일 목록 조회
    Optional<TeamTodoList> findByTeamIdAndUserId(Long teamId, Long userId);
    
    // 팀이 null인 개인 할일 목록 조회
    List<TeamTodoList> findByTeamIdIsNullAndUserIdOrderByCreateDateDesc(Long userId);
} 