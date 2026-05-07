package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.request.UpdateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.entity.*;
import org.example.tms.mapper.ProjectMapper;
import org.example.tms.repository.ProjectRepository;
import org.example.tms.repository.TeamRepository; // Добавлен
import org.example.tms.repository.TeamMemberRepository; // Добавлен
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
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    public ProjectResponse createProject(CreateProjectRequest dto) {
        // 1. Находим команду
        Team team = teamRepository.findById(dto.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found"));

        // 2. Проверяем права (Тимлид)
        checkIsTeamLead(team);

        // 3. Получаем текущего пользователя
        User currentUser = getCurrentUser();

        // 4. ПРОВЕРКА НА УНИКАЛЬНОСТЬ НАЗВАНИЯ
        if (projectRepository.existsByOwnerAndName(currentUser, dto.getName())) {
            throw new IllegalStateException("У вас уже есть проект с названием: " + dto.getName());
        }

        // 5. Создаем сущность через маппер
        Project project = projectMapper.toEntity(dto, team);

        // 6. Устанавливаем владельца и счетчики
        project.setOwner(currentUser);
        project.setTasksCount(0L);
        project.setCompletedCount(0L);

        return projectMapper.toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getMyProjects() {
        User user = getCurrentUser();

        // Получаем список команд, в которых состоит юзер
        List<Team> userTeams = teamMemberRepository.findAllByUser(user)
                .stream()
                .map(TeamMember::getTeam)
                .toList();

        // Если юзер нигде не состоит, возвращаем пустой список
        if (userTeams.isEmpty()) {
            return List.of();
        }

        // Достаем проекты всех этих команд одним запросом
        return projectRepository.findAllByTeamInWithFetch(userTeams)
                .stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Transactional
    public ProjectResponse updateProject(Long id, UpdateProjectRequest dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        // 1. Проверка уникальности имени (если оно пришло в DTO и оно новое)
        if (dto.getName() != null && !dto.getName().equals(project.getName())) {
            if (projectRepository.existsByOwnerAndName( project.getOwner(), dto.getName())) {
                throw new IllegalStateException("У вас уже есть проект с таким названием");
            }
        }

        // 2. Смена владельца (если пришел ownerId)
        if (dto.getOwnerId() != null) {
            User newOwner = userRepository.findById(dto.getOwnerId())
                    .orElseThrow(() -> new EntityNotFoundException("New owner not found"));
            project.setOwner(newOwner);
        }

        // 3. Используем маппер для обновления остальных полей (name, description)
        projectMapper.updateEntityFromDto(dto, project);

        return projectMapper.toResponse(projectRepository.save(project));
    }

    public void deleteProject(Long projectId) {
        Project project = getProjectOrThrow(projectId);

        // Удалять может только Тимлид команды проекта
        checkIsTeamLead(project.getTeam());

        projectRepository.delete(project);
    }

    // Вспомогательные методы

    private void checkIsTeamLead(Team team) {
        User user = getCurrentUser();
        TeamMember membership = teamMemberRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this team"));

        // Проверяем позицию из таблицы team_members
        if (!"TEAM_LEAD".equals(membership.getPosition())) {
            throw new AccessDeniedException("Only Team Lead can manage projects");
        }
    }

    @Transactional(readOnly = true)
    public long getTotalTasksInMyProjects() {
        // Используем ваш метод получения текущего юзера
        User currentUser = getCurrentUser();

        Long totalTasks = projectRepository.countTotalTasksInMyProjects(currentUser);

        return totalTasks != null ? totalTasks : 0L;
    }

    public ProjectResponse attachTeam(Long projectId, Long teamId) {
        Project project = getProjectOrThrow(projectId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found"));

        // Убеждаемся, что текущий пользователь - владелец проекта
        User currentUser = getCurrentUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only project owner can attach team");
        }

        if (project.getTeam() != null) {
            throw new IllegalStateException("Project is already attached to a team");
        }

        // Проверяем, является ли текущий юзер Тим лидом проекта
        checkIsTeamLead(team) ;

        // Привязываем новую команду к проекту
        project.setTeam(team);

        return projectMapper.toResponse(projectRepository.save(project));
    }


    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }
}