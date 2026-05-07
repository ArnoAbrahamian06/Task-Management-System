package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.request.UpdateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project", description = "Управление проектами")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("@securityService.canCreateProject()")
    public ResponseEntity<ProjectResponse> createProject(@RequestBody @Valid CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    @PreAuthorize("@securityService.canUpdateProject(#id)")
    @PatchMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProjectRequest dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.isProjectOwner(#id)")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/teams/{teamId}")
    @PreAuthorize("@securityService.isProjectOwner(#projectId)")
    public ResponseEntity<ProjectResponse> attachTeam(@PathVariable Long projectId, @PathVariable Long teamId) {
        return ResponseEntity.ok(projectService.attachTeam(projectId, teamId));
    }

    @GetMapping("/my/tasks-total")
    public ResponseEntity<Long> getTotalTasksCount() {
        return ResponseEntity.ok(projectService.getTotalTasksInMyProjects());
    }

}

