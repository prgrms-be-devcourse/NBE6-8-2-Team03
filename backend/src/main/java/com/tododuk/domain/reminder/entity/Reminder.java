package com.tododuk.domain.reminder.entity;

import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class Reminder extends BaseEntity {
    @ManyToOne
    private Todo todo;

    private LocalDateTime remindAt;
    private String method; //알림 내용? 알림 방법?
}
