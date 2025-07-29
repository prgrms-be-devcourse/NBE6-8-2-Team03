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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/notifications")
@RequiredArgsConstructor
public class ApiV1NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    record CreateNotificationReqBody(
            String userEmail,
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
                userService.findByUserEmail(createNotificationReqBody.userEmail).orElseThrow(() -> new IllegalArgumentException("User not found with email")),
                createNotificationReqBody.title(),
                createNotificationReqBody.description(),
                createNotificationReqBody.url()
        );
        if (notificationDto == null) {
            throw new RuntimeException("알림 생성 실패");
        }
        return new RsData("200-1", "알림이 생성되었습니다.", notificationDto);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "알림 삭제")
    public RsData<Optional> deleteNotification(@PathVariable int id) {

        Notification noti = notificationService.findById(id);
        if (noti == null) {
            return new RsData("400-1", "알림이 존재하지 않습니다.");
        }
        notificationService.deleteNotification(noti);
        return new RsData("200-1", "알림이 삭제되었습니다.", Optional.empty());
    }

    @GetMapping
    @Transactional
    @Operation(summary = "알람 다건 조회")
    public RsData<List<NotificationDto>> getNotificationById() {
        try {
            List<Notification> notification = notificationService.getNotifications();
            return new RsData<>("200-1", "알림이 조회되었습니다.",
                    notification.stream()
                            .map(NotificationDto::new)
                            .toList());
        } catch (IllegalArgumentException e) {
            return new RsData<>("400-1", "알림이 존재하지 않습니다.");
        }
    }

    @GetMapping("/{id}")
    @Transactional
    @Operation(summary = "알람 단건 조회")
    public RsData<NotificationDto> getNotificationById(@PathVariable int id) {
        try {
            Notification notification = notificationService.findById(id);
            return new RsData<>("200-1", "알림이 조회되었습니다.", new NotificationDto(notification));
        } catch (IllegalArgumentException e) {
            return new RsData<>("400-1", "알림이 존재하지 않습니다.");
        }
    }
    @PostMapping("/setStatus/{id}")
    @Transactional
    @Operation(summary = "알림 상태 변경")
    public RsData<NotificationDto> updateNotificationStatus(@PathVariable int id) {
        Notification notification = notificationService.updateNotificationStatus(Optional.ofNullable(notificationService.findById(id)));
        if (notification == null) {
            return new RsData("400-1", "알림 상태 변경 실패");
        }
        return new RsData("200-1", "알림 상태가 변경되었습니다.", new NotificationDto(notification));
    }



}
