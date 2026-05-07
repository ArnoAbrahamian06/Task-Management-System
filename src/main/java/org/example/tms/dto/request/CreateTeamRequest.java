package org.example.tms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTeamRequest {
    @NotBlank(message = "Название команды не может быть пустым")
    @Size(max = 100, message = "Название команды не должно превышать 100 символов")
    private String name;
}