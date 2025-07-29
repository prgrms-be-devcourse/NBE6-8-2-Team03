package com.tododuk.domain.notification.service;

import com.tododuk.domain.notification.dto.NotificationDto;
import com.tododuk.domain.notification.entity.Notification;
import com.tododuk.domain.notification.repository.NotificationRepository;
import com.tododuk.domain.reminder.dto.ReminderDto;
import com.tododuk.domain.reminder.service.ReminderService;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.service.UserService;
import com.tododuk.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {


    private  final NotificationRepository notificationRepository;
    private  final ReminderService reminderService;
    private final UserService userService;

    public NotificationDto CreateNotification(User user, String title, String description, String url) {

       Notification notification = new Notification();
        notificationRepository.save(notification);
        return new NotificationDto(notification);
    }

    public Notification findById(int id) {

        return notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));
    }

    public void deleteNotification(Notification noti) {

        notificationRepository.delete(noti);
    }

    public Optional<NotificationDto> getNotifications() {

        return notificationRepository.findAll().stream()
                .map(NotificationDto::new)
                .findFirst();
    }

    public NotificationDto CreateNotificationByReminder(int reminderId)
    {
        RsData<ReminderDto> reminder = reminderService.getReminderById(reminderId);
        User user= userService.findById(1);
        String title  = reminder.data().todo().getTitle();
        String description = "Reminder for: " + reminder.data().todo().getDescription();
        String url = "api/v1//todo/" + reminder.data().todo().getId();
        return CreateNotification(user, title, description, url);
    }




}