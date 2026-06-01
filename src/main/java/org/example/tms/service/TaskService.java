package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.request.UpdateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.*;
import org.example.tms.mapper.TaskMapper;
import org.example.tms.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskResponse createTask(CreateTaskRequest dto) {
        Project project = getProject(dto.getProjectId());
        User currentUser = getCurrentUser();

        // Проверяем, что создатель в команде проекта
        getMembership(currentUser, project.getTeam());

        TeamMember assignee = null;
        if (dto.getAssigneeId() != null) {
            User assigneeUser = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee user not found"));
            assignee = getOrCreateMembership(assigneeUser, project.getTeam());
        }

        Task task = taskMapper.toEntity(dto, project, assignee);
        task.setCreator(currentUser);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskDetails(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));
        return taskMapper.toResponse(task);
    }

    // ИСПРАВЛЕНО: Теперь используем переданный userId напрямую в репозитории
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllUserTasks(Long userId) {
        return taskRepository.findAllByAssigneeId(userId)
                .stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Long getMyInProgressTasksCount(Long userId) {
        return taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.IN_PROGRESS);
    }

    // ИСПРАВЛЕНО: Теперь используем переданный userId напрямую в репозитории
    @Transactional(readOnly = true)
    public Long getMyCompletedTasksCount(Long userId) {
        return taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.DONE);
    }

    // ИСПРАВЛЕНО: Теперь используем переданный userId напрямую в репозитории
    @Transactional(readOnly = true)
    public Long getOverdueTasksCount(Long userId) {
        return taskRepository.countOverdueTasksByUserId(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getHighPriorityTasks(Long userId) {
        // ВАЖНО: вызываем метод с Id в названии и передаем Long
        return taskRepository.findAllByAssigneeIdAndPriority(userId, TaskPriority.HIGH)
                .stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    // ИСПРАВЛЕНО: Передаем userId для получения топ-5 задач
    @Transactional(readOnly = true)
    public List<TaskResponse> getTop5PriorityTasks(Long userId) {
        List<Task> tasks = taskRepository.findTop5PriorityTasksByUserId(
                userId,
                PageRequest.of(0, 5));

        return tasks.stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task task = getTask(id);
        task.setStatus(status);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, UpdateTaskRequest dto) {
        Task task = getTask(id);
        taskMapper.updateEntityFromDto(dto, task);

        if (dto.getAssigneeId() != null) {
            User assigneeUser = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee user not found"));
            TeamMember assignee = getOrCreateMembership(assigneeUser, task.getProject().getTeam());
            task.setAssignee(assignee);
        }

        return taskMapper.toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // Вспомогательные методы

    private TeamMember getMembership(User user, Team team) {
        return teamMemberRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of the project team"));
    }

    private TeamMember getOrCreateMembership(User user, Team team) {
        return teamMemberRepository.findByUserAndTeam(user, team)
                .orElseGet(() -> {
                    TeamMember member = new TeamMember();
                    member.setUser(user);
                    member.setTeam(team);
                    member.setPosition("DEVELOPER");
                    return teamMemberRepository.save(member);
                });
    }


    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));
    }

    private Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    private Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
    }
}