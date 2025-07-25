package com.tododuk.domain.label.entity;

import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.user.entity.User;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Label extends BaseEntity {

    private String name;
    private String color;

    @ManyToOne
    private TodoLabel todoLabel;
    @ManyToOne
    private User user;

}
