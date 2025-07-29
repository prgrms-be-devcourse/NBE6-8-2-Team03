package com.tododuk.domain.notification.dto;

import com.tododuk.domain.notification.entity.Notification;
import lombok.NonNull;

public record NotificationDto(
        @NonNull String title,
        @NonNull String description,
        @NonNull String url,
        @NonNull boolean isRead
) {

    public NotificationDto(String title, String description, String url, boolean isRead) {

        this.title = title;
        this.description = description;
        this.url = url;
        this.isRead = isRead;
    }

    public NotificationDto(Notification notification) {

        this(
                notification.getTitle(),
                notification.getDescription(),
                notification.getUrl(),
                notification.isRead()
        );
    }

}
