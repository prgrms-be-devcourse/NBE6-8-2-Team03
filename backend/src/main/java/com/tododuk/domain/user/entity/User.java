package com.tododuk.domain.user.entity;

import com.tododuk.domain.label.entity.Label;
import com.tododuk.domain.teamMember.entity.TeamMember;
import com.tododuk.domain.todoList.entity.TodoList;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class User extends BaseEntity {

    private String userEmail;
    //패스워드는 우짜

    private String password;
    private String nickName;
    private boolean isAdmin;
    private String profileImgUrl;

    @OneToMany
    private List<TodoList> todoLists;
    @OneToMany
    private List<TeamMember> teamMember;
    @OneToMany
    private List<Label> labels;


}
