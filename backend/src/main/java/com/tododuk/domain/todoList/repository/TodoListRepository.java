package com.tododuk.domain.todoList.repository;

import com.tododuk.domain.todoList.entity.TodoList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoListRepository extends JpaRepository<TodoList, Integer> {
}
