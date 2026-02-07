package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.entity.*;
import org.example.tms.mapper.ProjectMapper;
import org.example.tms.repository.ProjectRepository;

import org.example.tms.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    public ProjectResponse createProject(CreateProjectRequest dto) {
        User owner = getCurrentUser();

        Project project = projectMapper.toEntity(dto, owner);
        project.getMembers().add(owner);

        return projectMapper.toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getMyProjects() {
        User user = getCurrentUser();

        return projectRepository.findByMembersContaining(user)
                .stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    public ProjectResponse addMember(Long projectId, Long userId) {
        Project project = getProjectOrThrow(projectId);
        User owner = getCurrentUser();

        if (!project.getOwner().equals(owner)) {
            throw new AccessDeniedException("Only owner can add members");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        project.getMembers().add(user);
        return projectMapper.toResponse(project);
    }

    public ProjectResponse removeMember(Long projectId, Long userId) {
        Project project = getProjectOrThrow(projectId);
        User owner = getCurrentUser();

        if (!project.getOwner().equals(owner)) {
            throw new AccessDeniedException("Only owner can remove members");
        }

        project.getMembers().removeIf(u -> u.getId().equals(userId));
        return projectMapper.toResponse(project);
    }

    public void deleteProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        if (!project.getOwner().equals(getCurrentUser())) {
            throw new AccessDeniedException("Only owner can delete project");
        }

        projectRepository.delete(project);
    }

    // helpers

    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow();
    }

    private Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }
}
