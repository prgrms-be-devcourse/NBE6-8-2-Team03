package com.tododuk.domain.todoLabel.repository;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TodoLabelRepository extends JpaRepository<TodoLabel, Integer> {
    Optional<TodoLabel> findByTodoIdAndLabelId(int todoId, int labelId);
}