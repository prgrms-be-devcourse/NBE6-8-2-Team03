package com.tododuk.domain.todo.entity;

import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Todo extends BaseEntity {
    private  String title;
    private String description;
    private boolean isCompleted;
    private int priority; // 1: Low, 2: Medium, 3: High

    private LocalDateTime startDate;
    private LocalDateTime dueDate;

//    @ManyToOne
//    private TodoList todoList;

    //업데이트 날짜는 제외 (erd 수정 필요)
}
