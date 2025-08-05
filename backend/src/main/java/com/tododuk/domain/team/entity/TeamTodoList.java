package com.tododuk.domain.team.entity;

import com.tododuk.domain.user.entity.User;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.CascadeType.REMOVE;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamTodoList extends BaseEntity {

    private String name;
    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @OneToMany(mappedBy = "teamTodoList", fetch = LAZY, cascade = REMOVE)
    @Builder.Default
    private List<TeamTodo> teamTodos = new ArrayList<>();

    public TeamTodoList(String name, String description, User user, Team team) {
        this.name = name;
        this.description = description;
        this.user = user;
        this.team = team;
    }

    public void addTeamTodo(TeamTodo teamTodo) {
        this.teamTodos.add(teamTodo);
        teamTodo.setTeamTodoList(this);
    }

    public void removeTeamTodo(TeamTodo teamTodo) {
        this.teamTodos.remove(teamTodo);
        teamTodo.setTeamTodoList(null);
    }
} 