package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // Создание проекта
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse createProject(
            @RequestParam Long ownerId,
            @Valid @RequestBody CreateProjectRequest request
    ) {
        return projectService.createProject(request, ownerId);
    }


    //  Получение проекта по id
    @GetMapping("/{id}")
    public ProjectResponse getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }


    //  Добавление участника в проект
    @PostMapping("/{projectId}/members/{userId}")
    public ProjectResponse addMember(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        return projectService.addMember(projectId, userId);
    }

    // Удаление участника из проекта
    @DeleteMapping("/{projectId}/members/{userId}")
    public ProjectResponse removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        return projectService.removeMember(projectId, userId);
    }
}
