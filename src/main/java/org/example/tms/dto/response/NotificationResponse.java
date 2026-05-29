package org.example.tms.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String description;
    private boolean read;
    private LocalDateTime createdAt;
}
