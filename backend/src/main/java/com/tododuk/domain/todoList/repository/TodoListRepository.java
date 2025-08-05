package com.tododuk.domain.todoList.repository;

import com.tododuk.domain.todoList.entity.TodoList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoListRepository extends JpaRepository<TodoList, Integer> {
    List<TodoList> findAllByUserId(Integer userId);
    Optional<TodoList> findByUserIdAndTeamIdIsNull(Integer userId);
    Optional<TodoList> findByTeamId(Integer teamId);
}
