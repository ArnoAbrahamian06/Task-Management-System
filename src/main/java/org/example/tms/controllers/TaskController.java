package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.request.UpdateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Создание задачи в проекте
    @PostMapping("/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        return taskService.createTask(projectId, request);
    }

    // Получение задачи по id
    @GetMapping("/tasks/{id}")
    public TaskResponse getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    // Обновление задачи
    @PatchMapping("/tasks/{id}")
    public TaskResponse updateTask(
            @PathVariable Long id,
            @RequestBody UpdateTaskRequest request
    ) {
        return taskService.updateTask(id, request);
    }


    // Удаление задачи
    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}
