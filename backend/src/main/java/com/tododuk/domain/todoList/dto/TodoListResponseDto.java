package com.tododuk.domain.todoList.dto;

import com.tododuk.domain.todoList.entity.TodoList;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TodoListResponseDto {
    private int id;
    private String name;
    private String description;
    private int userId;
    private int teamId;
    private LocalDateTime createDate;
    private LocalDateTime modifyDate;

    public static TodoListResponseDto from(TodoList todoList) {
        return new TodoListResponseDto(
                todoList.getId(),
                todoList.getName(),
                todoList.getDescription(),
                todoList.getUser().getId(),
                todoList.getTeam().getId(),
                todoList.getCreateDate(),
                todoList.getModifyDate()
        );
    }
}
