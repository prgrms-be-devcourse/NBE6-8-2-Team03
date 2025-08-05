package com.tododuk.domain.team.repository;

import com.tododuk.domain.team.entity.TeamTodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamTodoRepository extends JpaRepository<TeamTodo, Long> {
    
    // TeamTodoList별 할일 목록 조회
    List<TeamTodo> findByTeamTodoListIdOrderByCreateDateDesc(Long teamTodoListId);
    
    // 담당자별 할일 목록 조회
    List<TeamTodo> findByAssignedMemberIdOrderByCreateDateDesc(Integer assignedMemberId);
    
    // TeamTodoList와 담당자로 할일 목록 조회
    List<TeamTodo> findByTeamTodoListIdAndAssignedMemberIdOrderByCreateDateDesc(Long teamTodoListId, Integer assignedMemberId);
} 