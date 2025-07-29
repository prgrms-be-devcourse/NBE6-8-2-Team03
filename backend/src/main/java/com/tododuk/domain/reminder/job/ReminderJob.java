package com.tododuk.domain.reminder.job;

import com.tododuk.domain.notification.service.NotificationService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReminderJob implements Job {
    @Autowired
    NotificationService notificationService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        // 알림 처리 로직 작성
        int reminderId= context.getMergedJobDataMap().getInt("reminderId");
        System.out.println("ReminderJob executed for reminderId: " + reminderId);
        notificationService.CreateNotificationByReminder(reminderId);
    }
}