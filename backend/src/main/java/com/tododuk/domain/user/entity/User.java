package com.tododuk.domain.user.entity;

import com.tododuk.domain.label.entity.Label;
import com.tododuk.domain.notification.entity.Notification;
import com.tododuk.domain.team.entity.TeamMember;
import com.tododuk.domain.todoList.entity.TodoList;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="users")
public class User extends BaseEntity {

    private String userEmail;

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
    @OneToMany
    private List<Notification> notifications;


}
