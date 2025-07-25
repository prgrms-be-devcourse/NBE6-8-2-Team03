package com.tododuk.domain.todoLabel.service;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;

public class TodoLabelService {
    TodoLabelRepository todoLabelRepository;



    public void removeTodoLabelFromTodo(int todoId, int labelId){
        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
                .orElseThrow(()->new IllegalArgumentException("todoLabel not found"));

        todoLabelRepository.delete(todoLabel);
    }
}
