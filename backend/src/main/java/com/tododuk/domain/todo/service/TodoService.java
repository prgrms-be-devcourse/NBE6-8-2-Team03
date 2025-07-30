package com.tododuk.domain.todo.service;

import com.tododuk.domain.todo.dto.TodoResponseDto;
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoService {
    private final  TodoRepository todoRepository;

    public Todo save(Todo todo) {
        return todoRepository.save(todo);
    }
    public Todo createTodo(String title, String description, boolean completed) {
        Todo todo = new Todo(title, description, completed);
        return todoRepository.save(todo);
    }


    public Todo getTodoById(int id) {
     return  todoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Todo not found with id: " + id));
    }

    public List<TodoResponseDto> getAllTodos() {
        return todoRepository.findAll().stream()
                .map(TodoResponseDto::from)
                .toList();
    }
}