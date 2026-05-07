package org.example.tms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubtaskRequest {
    @NotBlank
    @Size(max = 500, message = "Текст подзадачи не должен превышать 500 символов")
    private String title;
}