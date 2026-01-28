package org.example.tms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.tms.dto.ProjectShortDto;
import org.example.tms.dto.UserShortDto;
import org.example.tms.entity.TaskPriority;
import org.example.tms.entity.TaskStatus;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;

    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime deadline;

    private ProjectShortDto project;
    private UserShortDto assignee;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

