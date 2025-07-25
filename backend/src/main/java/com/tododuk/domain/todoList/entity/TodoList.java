package com.tododuk.domain.todoList.entity;

import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.user.entity.User;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

import static jakarta.persistence.CascadeType.REMOVE;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@NoArgsConstructor
public class TodoList extends BaseEntity {

    private String name;
    private String description;

    @ManyToOne
    private User user;

    @ManyToOne
    private Team team;

    @OneToMany(fetch = LAZY, cascade = REMOVE)
    private List<Todo> todo;

}
