package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.service.ProjectService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ProjectResponse create(@RequestBody @Valid CreateProjectRequest dto) {
        return projectService.createProject(dto);
    }

    @GetMapping
    public List<ProjectResponse> getMyProjects() {
        return projectService.getMyProjects();
    }

    @PreAuthorize("@securityService.isProjectOwner(#id)")
    @PostMapping("/{id}/members/{userId}")
    public ProjectResponse addMember(
            @PathVariable Long id,
            @PathVariable Long userId
    ) {
        return projectService.addMember(id, userId);
    }

    @PreAuthorize("@securityService.isProjectOwner(#id)")
    @DeleteMapping("/{id}/members/{userId}")
    public ProjectResponse removeMember(
            @PathVariable Long id,
            @PathVariable Long userId
    ) {
        return projectService.removeMember(id, userId);
    }

    @PreAuthorize("@securityService.isProjectOwner(#id)")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}

