package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.entity.Project;
import org.example.tms.entity.Role;
import org.example.tms.entity.Task;
import org.example.tms.entity.User;
import org.example.tms.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final SubtaskRepository subtaskRepository;


    // ADMIN & GENERAL

    public boolean isAdmin() {
        User current = getCurrentUser();
        return current.getRole() == Role.ADMIN;
    }

    public boolean canCreateProject() {
        User current = getCurrentUser();
        // Может создавать проект любой аутентифицированный пользователь
        return current != null;
    }

    // PROJECT

    public boolean isProjectOwner(Long projectId) {
        User current = getCurrentUser();

        return projectRepository.findById(projectId)
                .map(p -> p.getOwner().equals(current))
                .orElse(false);
    }


    public boolean canUpdateProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return false;

        User currentUser = getCurrentUser();

        // 1. Проверка: является ли юзер владельцем (owner)
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        // 2. Проверка: является ли юзер лидом команды проекта
        boolean isLead = teamMemberRepository.findByUserAndTeam(currentUser, project.getTeam())
                .map(tm -> "TEAM_LEAD".equals(tm.getPosition()))
                .orElse(false);

        return isOwner || isLead;
    }

    public boolean canManageTeam(Long teamId) {
        User currentUser = getCurrentUser();

        // Проверяем, есть ли у текущего юзера роль TEAM_LEAD в этой команде
        return teamMemberRepository.findByUserAndTeam(currentUser,
                        teamRepository.getReferenceById(teamId))
                .map(tm -> "TEAM_LEAD".equals(tm.getPosition()))
                .orElse(false);
    }

    public boolean isProjectMember(Long projectId) {
        User current = getCurrentUser();

        return projectRepository.findById(projectId)
                .map(p -> p.getTeam() != null && p.getTeam().getMembers().stream()
                        .anyMatch(tm -> tm.getUser().equals(current)))
                .orElse(false);
    }

    // TASK

    public boolean isTaskAssignee(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        // Проверка на null обязательна!
        if (task.getAssignee() == null) {
            return false; // Если исполнителя нет, значит текущий юзер точно не исполнитель
        }

        User currentUser = getCurrentUser(); // Твой метод получения текущего юзера
        return task.getAssignee().getUser().getId().equals(currentUser.getId());
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

    public boolean canUpdateTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return false;

        User currentUser = getCurrentUser(); // метод получения текущего юзера из контекста

        // 1. Проверка на исполнителя (безопасная)
        boolean isAssignee = task.getAssignee() != null &&
                task.getAssignee().getUser().getId().equals(currentUser.getId());

        // 2. Проверка на Тимлида (через проект задачи)
        boolean isLead = teamMemberRepository.findByUserAndTeam(currentUser, task.getProject().getTeam())
                .map(tm -> "TEAM_LEAD".equals(tm.getPosition()))
                .orElse(false);

        return isAssignee || isLead;
    }

    public boolean canEditSubtask(Long subtaskId) {
        return subtaskRepository.findById(subtaskId)
                .map(subtask -> canUpdateTask(subtask.getTask().getId()))
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

    public boolean isTeamLead() {
            User current = getCurrentUser();

            return projectRepository.findAll().stream()
                    .filter(p -> p.getTeam() != null)
                    .flatMap(p -> p.getTeam().getMembers().stream())
                    .anyMatch(tm -> tm.getUser().equals(current) && "TEAM_LEAD".equals(tm.getPosition()));
    }
}

