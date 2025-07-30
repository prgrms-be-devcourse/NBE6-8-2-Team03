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
//    private int todoListId;

    //initData test를 위해 일시적으로 주석처리
//    @ManyToOne
//    private TodoList todoList;

    //업데이트 날짜는 제외 (erd 수정 필요)

    public Todo(String title, String description, boolean completed) {

        this.title = title;
        this.description = description;
        this.isCompleted = completed;
        this.priority = 2; // 기본값은 Medium으로 설정
        this.startDate = LocalDateTime.now(); // 생성 시 현재 시간으로 설정
        this.dueDate = null; // 기본값은 null로 설정
    }

}
