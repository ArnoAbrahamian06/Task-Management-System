package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.TaskStatus;
import org.example.tms.service.TaskService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PreAuthorize("@securityService.isProjectMember(#dto.projectId)")
    @PostMapping
    public TaskResponse create(@RequestBody @Valid CreateTaskRequest dto) {
        return taskService.createTask(dto);
    }

    @PreAuthorize("@securityService.isTaskAssignee(#id)")
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status
    ) {
        return taskService.updateStatus(id, status);
    }
    @PreAuthorize("@securityService.isCurrentUser(#id)")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}

