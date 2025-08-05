package com.tododuk.domain.todo.repository;

import com.tododuk.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository <Todo, Integer> {
    List<Todo> findAllByTodoListUserId(Integer userId);


    List<Todo> findAllByTodoListId(Integer id);

}
