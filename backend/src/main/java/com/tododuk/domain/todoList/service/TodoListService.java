package com.tododuk.domain.todoList.service;

import com.tododuk.domain.todoList.dto.TodoListResponseDto;
import com.tododuk.domain.todoList.repository.TodoListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoListService {

    private final TodoListRepository todoListRepository;

    public List<TodoListResponseDto> getAllTodoLists() {
        return todoListRepository.findAll().stream()
                .map(TodoListResponseDto::from)
                .toList();
    }
}
