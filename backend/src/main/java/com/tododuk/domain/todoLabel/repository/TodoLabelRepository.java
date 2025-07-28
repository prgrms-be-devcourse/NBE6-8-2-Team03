package com.tododuk.domain.todoLabel.repository;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoLabelRepository extends JpaRepository<TodoLabel, Integer> {

    List<TodoLabel> findByTodoId(int todoId);
}