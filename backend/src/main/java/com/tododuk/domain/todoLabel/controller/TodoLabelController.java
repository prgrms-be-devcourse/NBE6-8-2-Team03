package com.tododuk.domain.todoLabel.controller;

import com.tododuk.domain.todoLabel.dto.TodoLabelRequestDto;
import com.tododuk.domain.todoLabel.dto.TodoLabelResponseDto;
import com.tododuk.domain.todoLabel.service.TodoLabelService;
import com.tododuk.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/todo-labels")
public class TodoLabelController {

    private final TodoLabelService todoLabelService;

    @GetMapping("/todos/{todoId}/labels")
    public RsData<TodoLabelResponseDto> getTodoLabels(@PathVariable int todoId) {
        List<Integer> labelIds = todoLabelService.getTodoLabelIdsByTodoIds(todoId);

        TodoLabelResponseDto responseDto = new TodoLabelResponseDto(todoId, labelIds);

        return new RsData<>("200-1", "Todo 라벨 목록을 성공적으로 조회했습니다.", responseDto);
    }


    @PostMapping("/todos/{todoId}/labels")
    public RsData<TodoLabelResponseDto> createTodoLabels(@RequestBody TodoLabelRequestDto requestDto){
        todoLabelService.updateTodoLabel(requestDto.todoId(), requestDto.labelIds());

        TodoLabelResponseDto responseDto = new TodoLabelResponseDto(
                requestDto.todoId(),
                requestDto.labelIds()
        );
        return new RsData<>("200-1", "라벨이 성공적으로 수정되었습니다.", responseDto);
    }
}
