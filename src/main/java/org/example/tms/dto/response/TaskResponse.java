package org.example.tms.dto.response;


import lombok.Data;
import org.example.tms.entity.TaskPriority;
import org.example.tms.entity.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority; // Priority
    private LocalDateTime deadline; // Deadline Time

    private ProjectResponse project; // Project (name, id)
    private UserResponse assignee;  // Assignee
    private UserResponse creator;   // Creator

    private List<SubtaskResponse> subtasks; // Subtasks
}

