package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.request.UpdateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.TaskStatus;
import org.example.tms.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task", description = "Управление задачами")
public class TaskController {

    private final TaskService taskService;

    @PreAuthorize("@securityService.isProjectMember(#dto.projectId)")
    @PostMapping
    public ResponseEntity<TaskResponse> create(@RequestBody @Valid CreateTaskRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskDetails(id));
    }

    @PreAuthorize("@securityService.isTaskAssignee(#id) || @securityService.isTeamLead()")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateStatus(id, status));
    }

    @PreAuthorize("@securityService.canUpdateTask(#id)")
    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody @Valid UpdateTaskRequest dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @GetMapping("/my/in-progress/count")
    public ResponseEntity<Long> getInProgressCount() {
        return ResponseEntity.ok(taskService.getMyInProgressTasksCount());
    }

    @GetMapping("/my/completed/count")
    public ResponseEntity<Long> getCompletedCount() {
        return ResponseEntity.ok(taskService.getMyCompletedTasksCount());
    }

    @GetMapping("/my/overdue/count")
    public ResponseEntity<Long> getOverdueCount() {
        return ResponseEntity.ok(taskService.getOverdueTasksCount());
    }

    @GetMapping("/my/high-priority")
    public ResponseEntity<List<TaskResponse>> getHighPriorityTasks() {
        return ResponseEntity.ok(taskService.getHighPriorityTasks());
    }

    @PreAuthorize("@securityService.isTeamLead()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}