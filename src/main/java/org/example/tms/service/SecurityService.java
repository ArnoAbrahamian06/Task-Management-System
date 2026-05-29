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
    private final InvitationRepository invitationRepository;


    // ADMIN & GENERAL

    public boolean isAdmin() {
        User current = getCurrentUser();
        return current != null && current.getRole() == Role.ADMIN;
    }

    public boolean canCreateProject() {
        User current = getCurrentUser();
        // Может создавать проект любой аутентифицированный пользователь
        return current != null;
    }

    // PROJECT

    public boolean isProjectOwner(Long projectId) {
        User current = getCurrentUser();
        if (current == null) return false;

        return projectRepository.findById(projectId)
                .map(p -> p.getOwner().equals(current))
                .orElse(false);
    }


    public boolean canUpdateProject(Long projectId) {
        if (isAdmin()) return true;
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return false;

        User currentUser = getCurrentUser();
        if (currentUser == null) return false;

        // 1. Проверка: является ли юзер владельцем (owner)
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        // 2. Проверка: является ли юзер лидом команды проекта
        boolean isLead = teamMemberRepository.findByUserAndTeam(currentUser, project.getTeam())
                .map(tm -> tm.getPosition() != null && "TEAM_LEAD".equalsIgnoreCase(tm.getPosition().trim().replace(" ", "_")))
                .orElse(false);

        return isOwner || isLead;
    }

    public boolean canManageTeam(Long teamId) {
        if (isAdmin()) return true;
        User currentUser = getCurrentUser();
        if (currentUser == null) return false;
        return teamMemberRepository.isTeamLead(currentUser.getId(), teamId);
    }

    public boolean isProjectMember(Long projectId) {
        User current = getCurrentUser();
        if (current == null) return false;

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
        if (currentUser == null) return false;
        return task.getAssignee().getUser().getId().equals(currentUser.getId());
    }

    public boolean isTaskCreatorOrProjectOwner(Long taskId) {
        User current = getCurrentUser();
        if (current == null) return false;

        return taskRepository.findById(taskId)
                .map(task ->
                        task.getAssignee().equals(current) ||
                                task.getProject().getOwner().equals(current)
                )
                .orElse(false);
    }

    public boolean canCreateTask(Long projectId) {
        if (isAdmin()) return true;
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return false;
        User currentUser = getCurrentUser();
        if (currentUser == null) return false;
        return teamMemberRepository.findByUserAndTeam(currentUser, project.getTeam())
                .map(tm -> tm.getPosition() != null && "TEAM_LEAD".equalsIgnoreCase(tm.getPosition().trim().replace(" ", "_")))
                .orElse(false);
    }

    public boolean canViewTask(Long taskId) {
        if (isAdmin()) return true;
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return false;

        User currentUser = getCurrentUser();
        if (currentUser == null) return false;

        // 1. Проверка на исполнителя (assignee)
        boolean isAssignee = task.getAssignee() != null &&
                task.getAssignee().getUser().getId().equals(currentUser.getId());

        // 2. Проверка на Тимлида (team lead)
        boolean isLead = teamMemberRepository.findByUserAndTeam(currentUser, task.getProject().getTeam())
                .map(tm -> tm.getPosition() != null && "TEAM_LEAD".equalsIgnoreCase(tm.getPosition().trim().replace(" ", "_")))
                .orElse(false);

        return isAssignee || isLead;
    }

    public boolean canUpdateTask(Long taskId) {
        if (isAdmin()) return true;
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return false;

        User currentUser = getCurrentUser();
        if (currentUser == null) return false;

        // По новым правилам: ТОЛЬКО Тимлид может редактировать свойства задачи
        return teamMemberRepository.findByUserAndTeam(currentUser, task.getProject().getTeam())
                .map(tm -> tm.getPosition() != null && "TEAM_LEAD".equalsIgnoreCase(tm.getPosition().trim().replace(" ", "_")))
                .orElse(false);
    }


    public boolean canUpdateTaskStatus(Long taskId) {
        return canUpdateTask(taskId);
    }

    public boolean canDeleteTask(Long taskId) {
        return canUpdateTask(taskId);
    }

    public boolean canManageSubtasks(Long taskId) {
        return canUpdateTask(taskId); // Управление структурой чеклиста доступно только Тимлиду
    }

    public boolean canToggleSubtask(Long subtaskId) {
        org.example.tms.entity.Subtask subtask = subtaskRepository.findById(subtaskId).orElse(null);
        if (subtask == null) return false;
        return canViewTask(subtask.getTask().getId()); // Выполнить подзадачу может исполнитель или Тимлид
    }

    public boolean canEditSubtask(Long subtaskId) {
        org.example.tms.entity.Subtask subtask = subtaskRepository.findById(subtaskId).orElse(null);
        if (subtask == null) return false;
        return canUpdateTask(subtask.getTask().getId()); // Редактировать текст подзадачи может только Тимлид
    }

    public boolean canDeleteSubtask(Long subtaskId) {
        org.example.tms.entity.Subtask subtask = subtaskRepository.findById(subtaskId).orElse(null);
        if (subtask == null) return false;
        return canManageSubtasks(subtask.getTask().getId()); // Удалить подзадачу может только Тимлид
    }

    // USER

    public boolean canManageInvitation(Long invitationId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return false;
        return invitationRepository.findById(invitationId)
                .map(inv -> inv.getUser().getId().equals(currentUser.getId()))
                .orElse(false);
    }

    public boolean isCurrentUser(Long userId) {
        User current = getCurrentUser();
        if (current == null) return false;
        return current.getId().equals(userId);
    }



    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    public boolean isTeamLead() {
            User current = getCurrentUser();
            if (current == null) return false;

            return projectRepository.findAll().stream()
                    .filter(p -> p.getTeam() != null)
                    .flatMap(p -> p.getTeam().getMembers().stream())
                    .anyMatch(tm -> tm.getUser().equals(current) && tm.getPosition() != null && "TEAM_LEAD".equalsIgnoreCase(tm.getPosition().trim().replace(" ", "_")));
    }
}

