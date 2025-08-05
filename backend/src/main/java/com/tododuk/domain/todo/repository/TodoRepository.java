package com.tododuk.domain.todo.repository;

import com.tododuk.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository <Todo, Integer> {
    List<Todo> findAllByTodoListUserId(Integer userId);

    List<Todo> findAllByTodoListId(Integer id);
<<<<<<< HEAD

=======
<<<<<<< HEAD
<<<<<<< HEAD
    
>>>>>>> f4dce27 (fix(fe): 팀 상세 페이지 구현)
    // 할일 목록 ID로 할일 조회
    List<Todo> findByTodoListId(Integer todoListId);
}
<<<<<<< HEAD
=======
=======

<<<<<<< HEAD
=======
    
    // TodoList ID로 할일 목록 조회 (생성일 순으로 정렬)
    List<Todo> findByTodoListIdOrderByCreateDateDesc(Integer todoListId);
>>>>>>> ca82fbd (backup(fe): 팀 투두 서비스 철폐)
}
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)
=======
}
>>>>>>> cad2c1e (fix(fe): 깃헙 리베이스 충돌 문제 해결)
<<<<<<< HEAD
>>>>>>> 54c89b4 (fix(fe): 깃헙 리베이스 충돌 문제 해결)
=======
=======
    
    // 할일 목록 ID로 할일 조회
    List<Todo> findByTodoListId(Integer todoListId);
}
>>>>>>> 206ebe6 (fix(fe): 팀 상세 페이지 구현)
>>>>>>> f4dce27 (fix(fe): 팀 상세 페이지 구현)
