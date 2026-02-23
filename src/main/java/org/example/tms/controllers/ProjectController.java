package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.ProjectRequest;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAuthority('PROJECT_CREATE')") // Проверка из Role.permissions
    public ResponseEntity<ProjectResponse> createProject(@RequestBody CreateProjectRequest request) {
        // Предполагается наличие ProjectService
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        // Метод возвращает список проектов, где текущий пользователь является участником
        return ResponseEntity.ok(projectService.getMyProjects());
    }
}

