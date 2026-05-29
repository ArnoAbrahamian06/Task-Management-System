package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.response.NotificationResponse;
import org.example.tms.entity.Notification;
import org.example.tms.entity.User;
import org.example.tms.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import org.example.tms.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    @Transactional
    public Notification createNotification(User user, String type, String title, String description) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User currentUser = userService.getCurrentUserEntity();
        return notificationRepository.findAllByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        
        User currentUser = userService.getCurrentUserEntity();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Access Denied");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = userService.getCurrentUserEntity();
        List<Notification> notifications = notificationRepository.findAllByUserOrderByCreatedAtDesc(currentUser);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void clearAll() {
        User currentUser = userService.getCurrentUserEntity();
        List<Notification> notifications = notificationRepository.findAllByUserOrderByCreatedAtDesc(currentUser);
        notificationRepository.deleteAll(notifications);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse res = new NotificationResponse();
        res.setId(notification.getId());
        res.setType(notification.getType());
        res.setTitle(notification.getTitle());
        res.setDescription(notification.getDescription());
        res.setRead(notification.isRead());
        res.setCreatedAt(notification.getCreatedAt());
        return res;
    }

    @Transactional
    public NotificationResponse sendNotification(org.example.tms.dto.request.SendNotificationRequest request) {
        String type = request.getType() != null ? request.getType() : "INFO";
        
        if (request.getUserId() != null) {
            User recipient = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            Notification notification = createNotification(recipient, type, request.getTitle(), request.getDescription());
            return mapToResponse(notification);
        } else {
            List<User> allUsers = userRepository.findAll();
            for (User recipient : allUsers) {
                createNotification(recipient, type, request.getTitle(), request.getDescription());
            }
            NotificationResponse broadcastResult = new NotificationResponse();
            broadcastResult.setTitle(request.getTitle());
            broadcastResult.setDescription(request.getDescription());
            broadcastResult.setType(type);
            broadcastResult.setRead(true);
            broadcastResult.setCreatedAt(LocalDateTime.now());
            return broadcastResult;
        }
    }
}
