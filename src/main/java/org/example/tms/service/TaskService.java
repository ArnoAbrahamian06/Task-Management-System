package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.*;
import org.example.tms.mapper.TaskMapper;
import org.example.tms.repository.ProjectRepository;
import org.example.tms.repository.TaskRepository;
import org.example.tms.repository.UserRepository;


import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskResponse createTask(CreateTaskRequest dto) {
        User creator = getCurrentUser();
        Project project = getProject(dto.getProjectId());

        if (!project.getMembers().contains(creator)) {
            throw new AccessDeniedException("Not a project member");
        }

        User assignee = userRepository.findById(dto.getAssigneeId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Task task = taskMapper.toEntity(dto, project, assignee);

        return taskMapper.toResponse(taskRepository.save(task));
    }

    public TaskResponse updateStatus(Long taskId, TaskStatus status) {
        Task task = getTask(taskId);
        User user = getCurrentUser();

        if (!task.getAssignee().equals(user)) {
            throw new AccessDeniedException("Only assignee can update status");
        }

        task.setStatus(status);
        return taskMapper.toResponse(task);
    }

    public void deleteTask(Long taskId) {
        Task task = getTask(taskId);
        User user = getCurrentUser();

        boolean isOwner = task.getProject().getOwner().equals(user);
        boolean isCreator = task.getAssignee().equals(user);

        if (!isOwner && !isCreator) {
            throw new AccessDeniedException("No permission");
        }

        taskRepository.delete(task);
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow();
    }

    private Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    private Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
    }
}

