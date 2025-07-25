package com.tododuk.domain.teamMember.entity;

import com.tododuk.domain.todoList.entity.TodoList;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class TeamMember extends BaseEntity {
    private String role;

    @ManyToOne
    private Team team;
    @ManyToOne
    private User user;
    @OneToMany
    private List<TodoList> todoList; // 팀원은 TodoList를 가질 수 있음
    //joinDate는 BaseEntity에 있음
}
