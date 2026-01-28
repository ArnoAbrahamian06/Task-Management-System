package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.request.UpdateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.*;
import org.example.tms.mapper.TaskMapper;
import org.example.tms.repository.ProjectRepository;
import org.example.tms.repository.TaskRepository;
import org.example.tms.repository.UserRepository;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    // Создание задачи в проекте
    public TaskResponse createTask(Long projectId, CreateTaskRequest request) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // исполнитель должен быть участником проекта
        if (!project.getMembers().contains(assignee)
                && !project.getOwner().equals(assignee)) {
            throw new IllegalStateException("Assignee is not a project member");
        }

        Task task = taskMapper.toEntity(request, project, assignee);

        Task savedTask = taskRepository.save(task);

        return taskMapper.toResponse(savedTask);
    }


    // Получение задачи по id
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        return taskMapper.toResponse(task);
    }


    // Обновление задачи
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        User newAssignee = null;

        if (request.getAssigneeId() != null) {
            newAssignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            // нельзя назначить исполнителя не из проекта
            Project project = task.getProject();
            if (!project.getMembers().contains(newAssignee)
                    && !project.getOwner().equals(newAssignee)) {
                throw new IllegalStateException("Assignee is not a project member");
            }
        }

        taskMapper.updateEntity(task, request, newAssignee);

        Task updatedTask = taskRepository.save(task);

        return taskMapper.toResponse(updatedTask);
    }


    // Удаление задачи
    public void deleteTask(Long taskId) {

        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found");
        }

        taskRepository.deleteById(taskId);
    }
}


