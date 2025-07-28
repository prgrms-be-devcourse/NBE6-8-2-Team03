package com.tododuk.domain.todoLabel.service;

import com.tododuk.domain.label.entity.Label;
import com.tododuk.domain.label.repository.LabelRepository;
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.todo.repository.TodoRepository;
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

    private final TodoLabelRepository todoLabelRepository;
    private final TodoRepository todoRepository;
    private final LabelRepository labelRepository;

    //확인
    @Transactional
    public List<Integer> getTodoLabelIdsByTodoIds(int todoId) {
        return todoLabelRepository.findByTodoId(todoId).stream()
                .map(todoLabel -> todoLabel.getLabel().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoLabel createTodoLabel(int todoId, int labelId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("Todo not found"));

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new IllegalArgumentException("Label not found"));

        TodoLabel todoLabel = new TodoLabel(todo, label);
        return todoLabelRepository.save(todoLabel);
    }

    @Transactional
    public void createTodoLabels(int todoId, List<Integer> labelIds) {
        for (Integer labelId : labelIds) {
            createTodoLabel(todoId, labelId);
        }
    }

//    @Transactional
//    public void removeTodoLabelFromTodo(int todoId, int labelId) {
//        TodoLabel todoLabel = todoLabelRepository.findByTodoIdAndLabelId(todoId, labelId)
//                .orElseThrow(() -> new IllegalArgumentException("todoLabel not found"));
//
//        todoLabelRepository.delete(todoLabel);
//    }
//
//    @Transactional
//    public void updateTodoLabel(int todoId, List<Integer> labelIds) {
//        List<Integer> savedLabelIds = getTodoLabelIdsByTodoIds(todoId);
//
//        for (Integer labelId : savedLabelIds) {
//            removeTodoLabelFromTodo(todoId, labelId);
//        }
//        for (Integer labelId : labelIds) {
//            createTodoLabel(todoId, labelId);
//        }
//    }
}

