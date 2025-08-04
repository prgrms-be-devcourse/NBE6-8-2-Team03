package com.tododuk.domain.todoList.repository;

import com.tododuk.domain.todoList.entity.TodoList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoListRepository extends JpaRepository<TodoList, Integer> {
    List<TodoList> findAllByUserId(Integer userId);
}
