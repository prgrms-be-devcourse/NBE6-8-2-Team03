package com.tododuk.domain.todoList.controller;


import com.tododuk.domain.todoList.dto.TodoListReqDto;
import com.tododuk.domain.todoList.dto.TodoListResponseDto;
import com.tododuk.domain.todoList.entity.TodoList;
import com.tododuk.domain.todoList.service.TodoListService;
import com.tododuk.global.exception.ServiceException;
import com.tododuk.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todo-lists")
@RequiredArgsConstructor
@Tag(name = "todoLists")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoListController {

    private final TodoListService todoListService;

    @GetMapping
    @Transactional
    @Operation(summary = "전체 todolist 조회")
    public ResponseEntity<RsData<List<TodoListResponseDto>>> getAllTodoLists() {
        List<TodoListResponseDto> todolist = todoListService.getAllTodoLists();
        return ResponseEntity.ok(RsData.success("전체 todolist 조회 성공", todolist));
    }

    @GetMapping("/{list_id}")
    @Transactional
    @Operation(summary = "개별 todoList 조회")
    public ResponseEntity<RsData<TodoListResponseDto>> getTodoListById(@PathVariable Integer todoList_id){
        TodoListResponseDto list = todoListService.getTodoList(todoList_id);
        return ResponseEntity.ok(RsData.success("todolist 조회 성공", list));
    }

    @PostMapping
    @Transactional
    @Operation(summary = "todolist 생성")
    public ResponseEntity<RsData<TodoList>> addTodoList(
            @RequestBody TodoListReqDto reqDto
    ) {
        TodoList saveList = todoListService.addTodoList(reqDto);
        return ResponseEntity.ok(RsData.success("새로운 todo 생성 성공", saveList));
    }

    @PutMapping(value = "/{list_id}")
    @Transactional
    @Operation(summary = "todolist 수정")
    public ResponseEntity<RsData<TodoList>> updateTodoList(
            @PathVariable Integer list_id,
            @RequestBody TodoListReqDto reqDto
    ) {
        try {
            TodoList todoList = todoListService.updateTodoList(list_id, reqDto);
            return ResponseEntity.ok(RsData.success("todolist 수정 성공", todoList));
        } catch (Exception e) {
            throw new ServiceException("400-1", "수정에 실패하였습니다.");
        }
    }

    @DeleteMapping("/{list_id}")
    @Transactional
    @Operation(summary = "todolist 삭제")
    public ResponseEntity<RsData<TodoList>> deleteTodoList(
            @PathVariable Integer list_id
    ) {
        try {
            todoListService.deleteTodoList(list_id);
            return ResponseEntity.ok(RsData.success("todolist 삭제성공"));
        } catch (Exception e) {
            throw new ServiceException("400-1", "삭제에 실패하였습니다.");
        }
    }

    @GetMapping("/user/{user_id}")
    @Transactional
    @Operation(summary = "유저 아이디 별 todo list 조회")
    public ResponseEntity<RsData<List<TodoListResponseDto>>> getUserTodoList(
            @PathVariable Integer user_id
    ) {
        List<TodoListResponseDto> todoLists = todoListService.getUserTodoList(user_id);
        return ResponseEntity.ok(RsData.success("유저의 todo list 조회 성공", todoLists));
    }
}
