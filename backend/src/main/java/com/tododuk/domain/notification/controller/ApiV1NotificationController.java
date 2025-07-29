package com.tododuk.domain.notification.controller;

import com.tododuk.domain.notification.dto.NotificationDto;
import com.tododuk.domain.notification.entity.Notification;
import com.tododuk.domain.notification.service.NotificationService;
import com.tododuk.domain.user.service.UserService;
import com.tododuk.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/v1/notifications")
@RequiredArgsConstructor
public class ApiV1NotificationController {
    NotificationService notificationService;
    UserService userService;
    record CreateNotificationReqBody(
            int User_id,
            String title,
            String description,
            String url
    ) {
    }


    @PostMapping
    @Transactional
    @Operation(summary = "알림 생성")
    public RsData<NotificationDto> createNotification(@Valid @RequestBody CreateNotificationReqBody createNotificationReqBody) {

        NotificationDto notificationDto = notificationService.CreateNotification(
                userService.findById(createNotificationReqBody.User_id()),
                createNotificationReqBody.title(),
                createNotificationReqBody.description(),
                createNotificationReqBody.url()
        );
        if (notificationDto == null) {
            throw new RuntimeException("알림 생성 실패");
        }
        return new RsData("S-1", "알림이 생성되었습니다.", notificationDto);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "알림 삭제")
    public RsData<Optional> deleteNotification(@PathVariable int id) {

        Notification noti = notificationService.findById(id);
        if (noti == null) {
            return new RsData("F-1", "알림이 존재하지 않습니다.");
        }
        notificationService.deleteNotification(noti);
        return new RsData("S-1", "알림이 삭제되었습니다.", Optional.empty());
    }

    @GetMapping
    @Transactional
    @Operation(summary = "알람 다건 조회")
    public RsData<Optional<NotificationDto>> getNotifications() {

        Optional<NotificationDto> notifications = notificationService.getNotifications();
        if (notifications.isEmpty()) {
            return new RsData("F-1", "알림이 존재하지 않습니다.");
        }
        return new RsData("S-1", "알림이 조회되었습니다.", notifications);
    }



}
