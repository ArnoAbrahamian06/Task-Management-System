package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.MemberDetailsDto;
import org.example.tms.dto.request.CreateTeamRequest;
import org.example.tms.dto.response.TeamWithMembersResponse;
import org.example.tms.dto.response.TeamMembershipResponse;
import org.example.tms.entity.Team;
import org.example.tms.entity.TeamMember;
import org.example.tms.entity.User;
import org.example.tms.mapper.TeamMapper;
import org.example.tms.repository.TeamMemberRepository;
import org.example.tms.repository.TeamRepository;
import org.example.tms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamMemberRepository teamMemberRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;
    private final TeamRepository teamRepository;

    @Transactional
    public void createTeam(CreateTeamRequest request) {
        // 1. Получаем текущего аутентифицированного пользователя
        User currentUser = userService.getCurrentUserEntity();

        // 2. Создаем новую команду
        Team team = new Team();
        team.setName(request.getName());
        Team savedTeam = teamRepository.save(team);

        // 3. Создаем запись о членстве (автор становится Team Lead)
        TeamMember leader = new TeamMember();
        leader.setTeam(savedTeam);
        leader.setUser(currentUser);
        leader.setPosition("TEAM_LEAD");

        teamMemberRepository.save(leader);
    }

    @Transactional
    public void addUserToTeam(Long teamId, Long userId, String position) {
        // 1. Находим команду и пользователя
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Команда не найдена"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));

        // 2. Проверяем, не добавлен ли он уже
        if (teamMemberRepository.existsByUserAndTeam(user, team)) {
            throw new IllegalStateException("Пользователь уже является участником этой команды");
        }

        // 3. Создаем новую связь
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setPosition(position != null ? position : "MEMBER"); // Роль в команде
        member.setJoinedAt(LocalDateTime.now());

        teamMemberRepository.save(member);
    }

    public List<TeamMembershipResponse> getMyTeams() {
        // 1. Получаем текущего аутентифицированного пользователя
        User currentUser = userService.getCurrentUserEntity();

        // 2. Ищем все записи в связующей таблице по этому пользователю
        List<TeamMember> memberships = teamMemberRepository.findAllByUser(currentUser);

        // 3. Маппим результат в DTO
        return memberships.stream()
                .map(teamMapper::toMembershipResponse)
                .toList();
    }

    public List<TeamWithMembersResponse> getMyTeamsWithMembers() {
        User currentUser = userService.getCurrentUserEntity();


        List<TeamMember> allMemberships = teamMemberRepository.findAllCoworkersByUser(currentUser);

        // Группируем результат по командам в памяти
        return allMemberships.stream()
                .collect(Collectors.groupingBy(TeamMember::getTeam))
                .entrySet().stream()
                .map(entry -> {
                    Team team = entry.getKey();
                    List<TeamMember> members = entry.getValue();

                    List<MemberDetailsDto> memberDetails = members.stream()
                            .map(m -> new MemberDetailsDto(
                                    m.getUser().getId(),
                                    m.getUser().getName(),
                                    m.getPosition()
                            ))
                            .toList();

                    TeamWithMembersResponse response = new TeamWithMembersResponse();
                    response.setTeamId(team.getId());
                    response.setTeamName(team.getName());
                    response.setMembers(memberDetails);
                    return response;
                })
                .toList();
    }
}