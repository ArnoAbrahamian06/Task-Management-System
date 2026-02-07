package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.tms.dto.request.CreateUserRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.entity.Role;
import org.example.tms.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // USERS

    @PostMapping("/users")
    public UserResponse createUser(@RequestBody @Valid CreateUserRequest dto) {
        return adminService.createUser(dto);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PutMapping("/users/{id}/role")
    public UserResponse changeUserRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        return adminService.changeUserRole(id, role);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }

    // PROJECTS

    @GetMapping("/projects")
    public List<ProjectResponse> getAllProjects() {
        return adminService.getAllProjects();
    }

    @DeleteMapping("/projects/{id}")
    public void deleteProject(@PathVariable Long id) {
        adminService.deleteProject(id);
    }

    // TASKS

    @GetMapping("/tasks")
    public List<TaskResponse> getAllTasks() {
        return adminService.getAllTasks();
    }

    @DeleteMapping("/tasks/{id}")
    public void deleteTask(@PathVariable Long id) {
        adminService.deleteTask(id);
    }
}
