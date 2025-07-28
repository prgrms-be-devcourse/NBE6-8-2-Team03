package com.tododuk.domain.todoLabel.service;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class TodoLabelService {

    TodoLabelRepository todoLabelRepository;

    @Transactional
    public void createTodoLabel(int todoId, int labelId){
        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
                .orElseThrow(()->new IllegalArgumentException("todoLabel not found"));

        todoLabelRepository.save(todoLabel);
    }

    @Transactional
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
        List<Integer> savedLabelIds = getLabelIdsByTodoIds(todoId);

        for(Integer labelId : savedLabelIds){
            removeTodoLabelFromTodo(todoId, labelId);
        }
        for(Integer labelId : labelIds){
            createTodoLabel(todoId, labelId);
        }
    }

    @Transactional
    public List<Integer> getLabelIdsByTodoIds(int todoId){
        return todoLabelRepository.findByTodoId(todoId).stream()
                .map(todoLabel-> todoLabel.getLabel().getId())
                .collect(Collectors.toList());
    }
}
