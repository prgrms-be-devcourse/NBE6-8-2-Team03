package com.tododuk.domain.todoLabel.controller;

import com.tododuk.domain.todoLabel.dto.TodoLabelRequestDto;
import com.tododuk.domain.todoLabel.dto.TodoLabelResponseDto;
import com.tododuk.domain.todoLabel.service.TodoLabelService;
import com.tododuk.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/Label")
public class TodoLabelController {

    private final TodoLabelService todoLabelService;

    @PostMapping("/todo/labels")
    public RsData<TodoLabelResponseDto> createTodoLabel(@RequestBody TodoLabelRequestDto requestDto){
        todoLabelService.updateTodoLabel(requestDto.todoId(), requestDto.labelIds());

        TodoLabelResponseDto responseDto = new TodoLabelResponseDto(
                requestDto.todoId(),
                requestDto.labelIds()
        );
        return new RsData<>("200-1", "라벨이 성공적으로 수정되었습니다.", responseDto);
    }
}
