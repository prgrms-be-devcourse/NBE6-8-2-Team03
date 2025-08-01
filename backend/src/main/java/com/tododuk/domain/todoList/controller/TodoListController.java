package com.tododuk.domain.todoList.controller;


import com.tododuk.domain.todoList.dto.TodoListResponseDto;
import com.tododuk.domain.todoList.service.TodoListService;
import com.tododuk.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/todo-lists")
@Tag(name = "todoLists")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoListController {

    private TodoListService todoListService;

    @GetMapping
    @Transactional
    @Operation(summary = "전체 todolist 조회")
    public ResponseEntity<RsData<List<TodoListResponseDto>>> getAllTodoLists() {
        List<TodoListResponseDto> todolist = todoListService.getAllTodoLists();
        return ResponseEntity.ok(RsData.success("전체 todo 조회 성공", todolist));
    }
}
