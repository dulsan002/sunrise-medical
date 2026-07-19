package com.sunrisedental.service;

import com.sunrisedental.entity.Notification;
import com.sunrisedental.entity.User;
import com.sunrisedental.repository.NotificationRepository;
import com.sunrisedental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<Notification> getNotificationsForUser(String username) {
        return userRepository.findByUsername(username)
                .map(User::getUserId)
                .map(notificationRepository::findByUserIdOrderByCreatedAtDesc)
                .orElse(Collections.emptyList());
    }

    public long getUnreadCount(String username) {
        return userRepository.findByUsername(username)
                .map(User::getUserId)
                .map(notificationRepository::countByUserIdAndIsReadFalse)
                .orElse(0L);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getUserId());
            unread.forEach(n -> {
                if (!n.getIsRead()) {
                    n.setIsRead(true);
                    n.setReadAt(LocalDateTime.now());
                }
            });
            notificationRepository.saveAll(unread);
        });
    }

    @Transactional
    public void createNotification(Long userId, String type, String title, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void createNotificationForUsername(String username, String type, String title, String message) {
        userRepository.findByUsername(username).ifPresent(user -> {
            createNotification(user.getUserId(), type, title, message);
        });
    }
}
