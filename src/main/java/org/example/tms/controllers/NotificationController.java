package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.response.NotificationResponse;
import org.example.tms.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Управление уведомлениями пользователей")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Получить уведомления текущего пользователя")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Пометить уведомление как прочитанное")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Пометить все уведомления как прочитанные")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @Operation(summary = "Очистить все уведомления")
    public ResponseEntity<Void> clearAll() {
        notificationService.clearAll();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send")
    @org.springframework.security.access.prepost.PreAuthorize("@securityService.isAdmin()")
    @Operation(summary = "Отправить уведомление пользователю или сделать массовую рассылку")
    public ResponseEntity<NotificationResponse> sendNotification(@RequestBody @jakarta.validation.Valid org.example.tms.dto.request.SendNotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }
}
