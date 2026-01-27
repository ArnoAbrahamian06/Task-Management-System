package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.entity.*;
import org.example.tms.repository.TaskRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public Task getById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Task not found with id=" + id)
                );
    }

    @Transactional(readOnly = true)
    public Task getByName(String name) {
        return taskRepository.findByName(name)
                .orElseThrow(() ->
                        new EntityNotFoundException("Task not found with name = " + name)
                );
    }

    public Task createTask(String title, String description, TaskStatus status, TaskPriority priority, Project project, User assignee, LocalDateTime deadline) {
        if (taskRepository.existsByTitleAndProject(title, project)) {
            throw new IllegalArgumentException(
                    String.format("A task with title '%s' is already in project '%s'",
                            title, project.getName())
            );
        }

        Task task = Task.builder()
                .title(title)
                .description(description)
                .status(status)
                .priority(priority)
                .deadline(deadline)
                .project(project)
                .assignee(assignee)
                .build();

        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id=" + id);
        }

        taskRepository.deleteById(id);
    }
}

