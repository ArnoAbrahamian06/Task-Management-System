package org.example.tms.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProjectRequest {
    @Size(max = 100, message = "Название проекта слишком длинное")
    private String name;

    private String description;

    // Поле для смены владельца (если нужно передать права)
    private Long ownerId;
}