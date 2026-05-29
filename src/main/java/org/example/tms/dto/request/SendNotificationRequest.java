package org.example.tms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendNotificationRequest {
    private Long userId; // Null for system broadcast
    
    @NotBlank
    private String title;
    
    @NotBlank
    private String description;
    
    private String type; // e.g. INFO, WARNING, SUCCESS, TASK
}
