package com.tododuk.domain.todoLabel.service;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;
import org.springframework.transaction.annotation.Transactional;

public class TodoLabelService {

    TodoLabelRepository todoLabelRepository;

    @Transactional
    public void createTodoLabel(int todoId, int labelId){
        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
                .orElseThrow(()->new IllegalArgumentException("todoLabel not found"));

        todoLabelRepository.save(todoLabel);
    }

    public void createTodoLabels(){}

    @Transactional
    public void removeTodoLabelFromTodo(int todoId, int labelId){
        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
                .orElseThrow(()->new IllegalArgumentException("todoLabel not found"));

        todoLabelRepository.delete(todoLabel);
    }
}
