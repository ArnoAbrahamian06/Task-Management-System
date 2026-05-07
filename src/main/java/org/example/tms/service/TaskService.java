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

        // 1. Проверка прав создателя
        TeamMember creatorMember = getMembership(currentUser, project.getTeam());
        if (!"TEAM_LEAD".equals(creatorMember.getPosition())) {
            throw new AccessDeniedException("Only Team Lead can create tasks");
        }

        User assigneeUser = null;
        TeamMember assigneeMember = null;

        // 2. Исполнитель обрабатывается ТОЛЬКО если он передан в запросе
        if (dto.getAssigneeId() != null) {
            assigneeUser = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("User with id " + dto.getAssigneeId() + " not found"));

            // Проверяем, что он в команде
            assigneeMember = getMembership(assigneeUser, project.getTeam());
        }

        // 3. Мапим. В mapper нужно передать либо объект, либо null
        Task task = taskMapper.toEntity(dto, project, assigneeMember);

        // 4. Обновляем счетчик
        project.setTasksCount((project.getTasksCount() != null ? project.getTasksCount() : 0) + 1);
        projectRepository.save(project);

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus) {
        Task task = getTask(taskId);
        User currentUser = getCurrentUser();

        // 1. Проверка на Исполнителя (максимально безопасно через ID)
        boolean isAssignee = false;
        if (task.getAssignee() != null && task.getAssignee().getUser() != null) {
            // Сравниваем Long ID, а не сами объекты
            isAssignee = task.getAssignee().getUser().getId().equals(currentUser.getId());
        }

        // 2. Проверка на Тимлида (через твой метод getMembership)
        boolean isLead = false;
        try {
            TeamMember membership = getMembership(currentUser, task.getProject().getTeam());
            isLead = "TEAM_LEAD".equals(membership.getPosition());
        } catch (AccessDeniedException e) {
            // Если пользователь не в команде, getMembership выбросит исключение.
            // Мы его ловим, чтобы просто пометить isLead = false
            isLead = false;
        }

        // 3. Итоговая проверка прав
        if (!isAssignee && !isLead) {
            throw new AccessDeniedException("У вас нет прав для изменения статуса этой задачи");
        }

        // 4. Логика счетчиков
        updateTaskAndProjectCounters(task, newStatus);

        return taskMapper.toResponse(task);
    }

    private void updateTaskAndProjectCounters(Task task, TaskStatus newStatus) {
        TaskStatus oldStatus = task.getStatus();
        if (oldStatus == newStatus) return;

        Project project = task.getProject();
        if (newStatus == TaskStatus.DONE) {
            project.setCompletedCount(project.getCompletedCount() + 1);
        } else if (oldStatus == TaskStatus.DONE) {
            project.setCompletedCount(Math.max(0, project.getCompletedCount() - 1));
        }
        task.setStatus(newStatus);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest dto) {
        Task task = getTask(taskId);

        // Обработка смены статуса (влияет на счетчики проекта)
        if (dto.getStatus() != null && task.getStatus() != dto.getStatus()) {
            updateTaskAndProjectCounters(task, dto.getStatus());
        }

        // Обработка смены исполнителя (по ID из DTO)
        if (dto.getAssigneeId() != null) {
            TeamMember newAssignee = teamMemberRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("TeamMember not found"));

            // Проверяем, что новый исполнитель из той же команды, что и проект
            if (!newAssignee.getTeam().getId().equals(task.getProject().getTeam().getId())) {
                throw new IllegalStateException("User is not in this project's team");
            }
            task.setAssignee(newAssignee);
        }

        task.setUpdatedAt(LocalDateTime.now());

        // MapStruct обновит остальные поля (title, description, priority, deadline)
        taskMapper.updateEntityFromDto(dto, task);

        return taskMapper.toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long taskId) {
        Task task = getTask(taskId);
        Project project = task.getProject();

        // Проверяем права (только Тимлид может удалять задачи)
        TeamMember membership = getMembership(getCurrentUser(), project.getTeam());
        if (!"TEAM_LEAD".equals(membership.getPosition())) {
            throw new AccessDeniedException("Only Team Lead can delete tasks");
        }

        // Обновляем счетчики перед удалением
        project.setTasksCount(Math.max(0, project.getTasksCount() - 1));
        if (task.getStatus() == TaskStatus.DONE) {
            project.setCompletedCount(Math.max(0, project.getCompletedCount() - 1));
        }

        taskRepository.delete(task);
    }


    @Transactional(readOnly = true)
    public long getMyInProgressTasksCount() {
        // Используем ваш метод получения текущего пользователя из контекста
        User currentUser = getCurrentUser();

        // Передаем статус IN_PROGRESS из перечисления TaskStatus
        return taskRepository.countAllMyTasksByStatus(currentUser, TaskStatus.IN_PROGRESS);
    }


    @Transactional(readOnly = true)
    public long getMyCompletedTasksCount() {
        User currentUser = getCurrentUser();
        // Убедитесь, что в вашем TaskStatus статус называется COMPLETED или DONE
        return taskRepository.countAllMyTasksByStatus(currentUser, TaskStatus.DONE);
    }

    @Transactional(readOnly = true)
    public long getOverdueTasksCount() {
        User currentUser = getCurrentUser();

        // Считаем все задачи, дедлайн которых прошел,
        // но которые еще не перешли в статус COMPLETED
        return taskRepository.countOverdueTasksInMyProjects(
                currentUser,
                LocalDateTime.now(),
                TaskStatus.DONE
        );
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getHighPriorityTasks() {
        User currentUser = getCurrentUser();

        List<Task> tasks = taskRepository.findAllTasksByPriorityInMyProjects(
                currentUser,
                TaskPriority.HIGH
        );

        // Используем ваш taskMapper для преобразования в Response-объекты
        return tasks.stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskDetails(Long id) {
        Task task = taskRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));

        // Маппер должен уметь превращать вложенные сущности в DTO
        return taskMapper.toResponse(task);
    }

//    @Transactional(readOnly = true)
//    public List<TaskResponse> getTop5PriorityTasks() {
//        User currentUser = getCurrentUser();
//
//        // Ограничиваем результат 5 записями
//        List<Task> tasks = taskRepository.findTop5PriorityTasks(
//                currentUser,
//                PageRequest.of(0, 5)
//        );
//
//        return tasks.stream()
//                .map(taskMapper::toResponse)
//                .toList();
//    }


    // Вспомогательные методы

    private TeamMember getMembership(User user, Team team) {
        return teamMemberRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of the project team"));
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow(() -> new EntityNotFoundException("Current user not found"));
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
 