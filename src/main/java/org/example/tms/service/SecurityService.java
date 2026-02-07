package org.example.tms.service;

import lombok.RequiredArgsConstructor;
import org.example.tms.entity.User;
import org.example.tms.repository.ProjectRepository;
import org.example.tms.repository.TaskRepository;
import org.example.tms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // PROJECT

    public boolean isProjectOwner(Long projectId) {
        User current = getCurrentUser();

        return projectRepository.findById(projectId)
                .map(p -> p.getOwner().equals(current))
                .orElse(false);
    }

    public boolean isProjectMember(Long projectId) {
        User current = getCurrentUser();

        return projectRepository.findById(projectId)
                .map(p -> p.getMembers().contains(current))
                .orElse(false);
    }

    // TASK

    public boolean isTaskAssignee(Long taskId) {
        User current = getCurrentUser();

        return taskRepository.findById(taskId)
                .map(t -> t.getAssignee().equals(current))
                .orElse(false);
    }

    public boolean isTaskCreatorOrProjectOwner(Long taskId) {
        User current = getCurrentUser();

        return taskRepository.findById(taskId)
                .map(task ->
                        task.getAssignee().equals(current) ||
                                task.getProject().getOwner().equals(current)
                )
                .orElse(false);
    }

    // USER

    public boolean isCurrentUser(Long userId) {
        User current = getCurrentUser();
        return current.getId().equals(userId);
    }



    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow();
    }
}

