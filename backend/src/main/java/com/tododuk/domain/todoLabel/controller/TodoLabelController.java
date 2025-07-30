package com.tododuk.domain.todoLabel.controller;

import com.tododuk.domain.todoLabel.dto.CreateTodoLabelRequestDto;
import com.tododuk.domain.todoLabel.dto.CreateTodoLabelResponseDto;
import com.tododuk.domain.todoLabel.dto.TodoLabelRequestDto;
import com.tododuk.domain.todoLabel.dto.TodoLabelResponseDto;
import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.service.TodoLabelService;
import com.tododuk.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/todos")
public class TodoLabelController {

    private final TodoLabelService todoLabelService;

    @GetMapping("/{todoId}/labels")
    public RsData<TodoLabelResponseDto> getTodoLabels(@PathVariable int todoId) {
        List<Integer> labelIds = todoLabelService.getTodoLabelIdsByTodoIds(todoId);

        TodoLabelResponseDto responseDto = new TodoLabelResponseDto(todoId, labelIds);

        return new RsData<>("200-1", "Todo 라벨 목록을 성공적으로 조회했습니다.", responseDto);
    }

    @PostMapping("/{todoId}/label")
    public RsData<CreateTodoLabelResponseDto> createTodoLabel(@RequestBody CreateTodoLabelRequestDto request ) {

        TodoLabel savedTodoLabel = todoLabelService.createTodoLabel(request.todoId(), request.labelId());

        CreateTodoLabelResponseDto responseDto = new CreateTodoLabelResponseDto(
                savedTodoLabel.getTodo().getId(),
                savedTodoLabel.getLabel().getId()
        );

        return new RsData<>("200-1", "Todo에 라벨을 성공적으로 연결했습니다.", responseDto);
    }

    @PostMapping("/{todoId}/labels")
    public RsData<TodoLabelResponseDto> createTodoLabels(@RequestBody TodoLabelRequestDto request){
        List<TodoLabel> savedTodoLabels = todoLabelService.createTodoLabels(request.todoId(), request.labelIds());

        List<Integer> labelIds = savedTodoLabels.stream()
                .map(todoLabel->todoLabel.getLabel().getId()).collect(Collectors.toList());

        TodoLabelResponseDto responseDto = new TodoLabelResponseDto(
                request.todoId(), labelIds);

        return new RsData<>("200-1", "라벨들이 성공적으로 연결되었습니다.", responseDto);
    }

    @PutMapping("/{todoId}/labels")
    public RsData<TodoLabelResponseDto> updateTodoLabels(@RequestBody TodoLabelRequestDto request){
        List<TodoLabel> savedTodoLabels = todoLabelService.updateTodoLabels(request.todoId(), request.labelIds());

        List<Integer> labelIds = savedTodoLabels.stream()
                .map(todoLabel->todoLabel.getLabel().getId()).collect(Collectors.toList());

        TodoLabelResponseDto responseDto = new TodoLabelResponseDto(
                request.todoId(), labelIds);

        return new RsData<>("200-1", "라벨들이 성공적으로 수정&연결되었습니다.", responseDto);
    }
}
