package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.tms.dto.request.CreateUserRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.dto.response.TeamWithMembersResponse;
import org.example.tms.entity.Role;
import org.example.tms.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("@securityService.isAdmin()")
@Tag(name = "Admin", description = "Управление панелью администратора")
public class AdminController {

    private final AdminService adminService;
    // --- USERS ---

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(dto));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> changeUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(adminService.changeUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // --- PROJECTS ---

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(adminService.getAllProjects());
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        adminService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // --- TASKS ---

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(adminService.getAllTasks());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        adminService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // --- TEAMS ---

    @GetMapping("/teams")
    public ResponseEntity<List<TeamWithMembersResponse>> getAllTeams() {
        return ResponseEntity.ok(adminService.getAllTeamsWithMembers());
    }

    // --- METRICS ---

    @GetMapping("/system/metrics")
    public ResponseEntity<org.example.tms.dto.response.SystemMetricsResponse> getSystemMetrics() {
        return ResponseEntity.ok(adminService.getSystemMetrics());
    }
}
