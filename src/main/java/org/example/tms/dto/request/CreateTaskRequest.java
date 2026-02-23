package org.example.tms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.example.tms.entity.TaskPriority;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotBlank
    private String title;

    @NotNull
    private Long projectId;

    private String description;

    @NotNull
    private TaskPriority priority;

    private LocalDateTime deadline;

    private Long assigneeId;
}