package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.InvitationRequest;
import org.example.tms.dto.response.InvitationResponse;
import org.example.tms.entity.Invitation;
import org.example.tms.entity.Team;
import org.example.tms.entity.User;
import org.example.tms.repository.InvitationRepository;
import org.example.tms.repository.TeamMemberRepository;
import org.example.tms.repository.TeamRepository;
import org.example.tms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamService teamService;

    @Transactional
    public InvitationResponse sendInvitation(Long teamId, InvitationRequest dto, User inviter) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Команда не найдена"));

        User targetUser = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Пользователь с таким email не найден"));

        // 1. Проверяем, не состоит ли пользователь уже в команде
        if (teamMemberRepository.existsByUserAndTeam(targetUser, team)) {
            throw new IllegalStateException("Пользователь уже состоит в этой команде");
        }

        // 2. Проверяем, нет ли уже активного (PENDING) приглашения
        if (invitationRepository.existsByUserAndTeamAndStatus(targetUser, team, "PENDING")) {
            throw new IllegalStateException("Приглашение этому пользователю уже отправлено и ожидает ответа");
        }

        Invitation invitation = new Invitation();
        invitation.setTeam(team);
        invitation.setUser(targetUser);
        invitation.setInviter(inviter);
        invitation.setPosition(dto.getPosition() != null ? dto.getPosition() : "MEMBER");
        invitation.setStatus("PENDING");
        invitation.setCreatedAt(LocalDateTime.now());

        Invitation saved = invitationRepository.save(invitation);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> getMyPendingInvitations(User user) {
        return invitationRepository.findAllByUserAndStatus(user, "PENDING")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> getPendingInvitationsForTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Команда не найдена"));
        return invitationRepository.findAllByTeamAndStatus(team, "PENDING")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void acceptInvitation(Long invitationId, User user) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new EntityNotFoundException("Приглашение не найдено"));

        if (!invitation.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Вы не можете принять это приглашение");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new IllegalStateException("Приглашение уже обработано");
        }

        // 1. Меняем статус
        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        // 2. Добавляем в команду
        teamService.addUserToTeam(
                invitation.getTeam().getId(),
                invitation.getUser().getId(),
                invitation.getPosition()
        );
    }

    @Transactional
    public void declineInvitation(Long invitationId, User user) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new EntityNotFoundException("Приглашение не найдено"));

        if (!invitation.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Вы не можете отклонить это приглашение");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new IllegalStateException("Приглашение уже обработано");
        }

        invitation.setStatus("DECLINED");
        invitationRepository.save(invitation);
    }

    private InvitationResponse mapToResponse(Invitation inv) {
        InvitationResponse res = new InvitationResponse();
        res.setId(inv.getId());
        res.setTeamId(inv.getTeam().getId());
        res.setTeamName(inv.getTeam().getName());
        res.setInviterId(inv.getInviter().getId());
        res.setInviterName(inv.getInviter().getName() != null ? inv.getInviter().getName() : inv.getInviter().getEmail());
        res.setPosition(inv.getPosition());
        res.setStatus(inv.getStatus());
        res.setCreatedAt(inv.getCreatedAt());
        return res;
    }
}
