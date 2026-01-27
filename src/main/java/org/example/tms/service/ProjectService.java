package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.entity.*;
import org.example.tms.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found with id=" + id)
                );
    }

    @Transactional(readOnly = true)
    public Project getByName(String name) {
        return projectRepository.findByName(name)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found with name = " + name)
                );
    }

    public Project createProject(String name, String description, User owner, Set<User> members, List<Task> tasks, User assignee) {
        if (projectRepository.existsByOwnerAndName(owner, name)) {
            throw new IllegalArgumentException(
                    String.format("A user named %s already has a project called << %s >>",
                            owner.getName(), name)
            );
        }

        Project project = Project.builder()
                .name(name)
                .description(description)
                .owner(owner)
                .members(members)
                .tasks(tasks)
                .build();

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("Project not found with id=" + id);
        }

        projectRepository.deleteById(id);
    }
}
