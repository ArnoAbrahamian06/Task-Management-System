package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.entity.*;
import org.example.tms.mapper.ProjectMapper;
import org.example.tms.repository.ProjectRepository;

import org.example.tms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;


    // Создание проекта
    public ProjectResponse createProject(CreateProjectRequest request, Long ownerId) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Project project = projectMapper.toEntity(request, owner);

        // владелец автоматически становится участником проекта
        project.getMembers().add(owner);

        Project savedProject = projectRepository.save(project);

        return projectMapper.toResponse(savedProject);
    }

    // Получение проекта по id
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        return projectMapper.toResponse(project);
    }


     // Добавление участника в проект
    public ProjectResponse addMember(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // нельзя добавить одного и того же пользователя дважды
        if (project.getMembers().contains(user)) {
            throw new IllegalStateException("User already a member");
        }

        project.getMembers().add(user);

        Project updatedProject = projectRepository.save(project);

        return projectMapper.toResponse(updatedProject);
    }


    // Удаление участника из проекта
    public ProjectResponse removeMember(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // нельзя удалить владельца проекта
        if (project.getOwner().equals(user)) {
            throw new IllegalStateException("Cannot remove project owner");
        }

        project.getMembers().remove(user);

        Project updatedProject = projectRepository.save(project);

        return projectMapper.toResponse(updatedProject);
    }
}
