package com.tododuk.domain.notification.entity;

import com.tododuk.domain.user.entity.User;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Notification extends BaseEntity {
    @ManyToOne
    private User user;

    private String title;
    private String description;
    private String url;
    private boolean isRead;

}
