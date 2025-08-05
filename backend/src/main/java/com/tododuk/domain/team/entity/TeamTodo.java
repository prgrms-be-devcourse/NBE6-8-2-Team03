package com.tododuk.domain.team.entity;

import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamTodo extends BaseEntity {
    
    private String title;
    private String description;
    private boolean isCompleted;
    private int priority; // 1: Low, 2: Medium, 3: High
    
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    
    // 담당 멤버 ID (팀 할일인 경우)
    private Integer assignedMemberId;
    
    // 할일 타입 (personal/team)
    private String type;
    
    @ManyToOne
    @JoinColumn(name = "team_todo_list_id")
    private TeamTodoList teamTodoList;
    
    public TeamTodo(String title, String description, boolean completed, Integer assignedMemberId) {
        this.title = title;
        this.description = description;
        this.isCompleted = completed;
        this.priority = 2; // 기본값은 Medium
        this.startDate = LocalDateTime.now();
        this.dueDate = null;
        this.assignedMemberId = assignedMemberId;
    }
    
    public void update(String title, String description, int priority, boolean isCompleted, LocalDateTime dueDate, Integer assignedMemberId) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.isCompleted = isCompleted;
        this.dueDate = dueDate;
        this.assignedMemberId = assignedMemberId;
    }
    
    public boolean isCompleted() {
        return isCompleted;
    }
} 