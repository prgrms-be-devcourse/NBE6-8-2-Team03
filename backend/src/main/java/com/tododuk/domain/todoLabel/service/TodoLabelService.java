package com.tododuk.domain.todoLabel.service;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

public class TodoLabelService {

    TodoLabelRepository todoLabelRepository;

    @Transactional
    public void createTodoLabel(int todoId, int labelId){
        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
                .orElseThrow(()->new IllegalArgumentException("todoLabel not found"));

        todoLabelRepository.save(todoLabel);
    }

    public void createTodoLabels(int todoId, List<Integer> labelIds){
        for(Integer labelId : labelIds){
            createTodoLabel(todoId, labelId);
        }
    }

    @Transactional
    public void removeTodoLabelFromTodo(int todoId, int labelId){
        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
                .orElseThrow(()->new IllegalArgumentException("todoLabel not found"));

        todoLabelRepository.delete(todoLabel);
    }

    @Transactional
    public void updateTodoLabel(int todoId, List<Integer> labelIds){
        List<Integer> existLabelIds = getLabelIdsByTodoIds(todoId);

        for(Integer labelId : existLabelIds){
            removeTodoLabelFromTodo(todoId, labelId);
        }
        for(Integer labelId : labelIds){
            createTodoLabel(todoId, labelId);
        }
    }

    public List<Integer> getLabelIdsByTodoIds(int todoId){
        return todoLabelRepository.findByTodoId(todoId).stream()
                .map(todoLabel-> todoLabel.getLabel().getId())
                .collect(Collectors.toList());
    }
}
