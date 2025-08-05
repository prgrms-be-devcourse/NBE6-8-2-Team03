package com.tododuk.domain.todo.repository;

import com.tododuk.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository <Todo, Integer> {
    List<Todo> findAllByTodoListUserId(Integer userId);
<<<<<<< HEAD

    List<Todo> findAllByTodoListId(Integer id);
<<<<<<< HEAD
    
    // 할일 목록 ID로 할일 조회
    List<Todo> findByTodoListId(Integer todoListId);
}
=======

=======
    
    // TodoList ID로 할일 목록 조회 (생성일 순으로 정렬)
    List<Todo> findByTodoListIdOrderByCreateDateDesc(Integer todoListId);
>>>>>>> ca82fbd (backup(fe): 팀 투두 서비스 철폐)
}
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)
