package com.tododuk.domain.todo.controller;

import com.tododuk.domain.todo.dto.TodoResponseDto;
import com.tododuk.domain.todo.service.TodoService;
import com.tododuk.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/todo")
@RequiredArgsConstructor
@Tag(name = "todo")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoController {

    private final TodoService todoService;

    @GetMapping // 메인에서 todo버튼 클릭시 이동하는 처음 화면
    @Transactional
    @Operation(summary = "전체 todo 조회")
    public ResponseEntity<RsData<List<TodoResponseDto>>>getAllTodos() {
        List<TodoResponseDto> todos = todoService.getAllTodos();
        return ResponseEntity.ok(RsData.success("전체 todo 조회", todos));
    }
}
