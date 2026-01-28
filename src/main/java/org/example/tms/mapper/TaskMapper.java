package org.example.tms.mapper;

import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.request.UpdateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.Project;
import org.example.tms.entity.Task;
import org.example.tms.entity.TaskStatus;
import org.example.tms.entity.User;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TaskMapper {

    private final ProjectMapper projectMapper;
    private final UserMapper userMapper;

    public Task toEntity(CreateTaskRequest dto, Project project, User assignee) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setStatus(TaskStatus.TODO);
        task.setDeadline(dto.getDeadline());
        task.setProject(project);
        task.setAssignee(assignee);
        return task;
    }

    public void updateEntity(Task task, UpdateTaskRequest dto, User assignee) {
        if (dto.getTitle() != null) {
            task.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
        }
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
        }
        if (dto.getDeadline() != null) {
            task.setDeadline(dto.getDeadline());
        }
        if (assignee != null) {
            task.setAssignee(assignee);
        }
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDeadline(),
                projectMapper.toShortDto(task.getProject()),
                userMapper.toShortDto(task.getAssignee()),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}


