package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.InvitationRequest;
import org.example.tms.dto.response.InvitationResponse;
import org.example.tms.entity.User;
import org.example.tms.service.InvitationService;
import org.example.tms.service.UserService;
import org.example.tms.service.SecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Invitations", description = "Управление приглашениями в команды")
public class InvitationController {

    private final InvitationService invitationService;
    private final UserService userService;
    private final SecurityService securityService;

    @PostMapping("/teams/{teamId}/invitations")
    @Operation(summary = "Отправить приглашение пользователю в команду", description = "Только тимлид команды может приглашать")
    public ResponseEntity<InvitationResponse> sendInvitation(
            @PathVariable Long teamId,
            @RequestBody @Valid InvitationRequest request) {

        if (!securityService.canManageTeam(teamId)) {
            throw new AccessDeniedException("Access Denied");
        }

        User inviter = userService.getCurrentUserEntity();
        InvitationResponse response = invitationService.sendInvitation(teamId, request, inviter);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/invitations/my/pending")
    @Operation(summary = "Получить список активных (PENDING) приглашений текущего пользователя")
    public ResponseEntity<List<InvitationResponse>> getMyPendingInvitations() {
        User currentUser = userService.getCurrentUserEntity();
        return ResponseEntity.ok(invitationService.getMyPendingInvitations(currentUser));
    }

    @GetMapping("/teams/{teamId}/invitations/pending")
    @Operation(summary = "Получить список отправленных (PENDING) приглашений команды", description = "Только для тимлида команды")
    public ResponseEntity<List<InvitationResponse>> getTeamPendingInvitations(@PathVariable Long teamId) {
        if (!securityService.canManageTeam(teamId)) {
            throw new AccessDeniedException("Access Denied");
        }
        return ResponseEntity.ok(invitationService.getPendingInvitationsForTeam(teamId));
    }

    @PostMapping("/invitations/{id}/accept")
    @Operation(summary = "Принять приглашение в команду")
    public ResponseEntity<Void> acceptInvitation(@PathVariable Long id) {
        if (!securityService.canManageInvitation(id)) {
            throw new AccessDeniedException("Access Denied");
        }
        User currentUser = userService.getCurrentUserEntity();
        invitationService.acceptInvitation(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invitations/{id}/decline")
    @Operation(summary = "Отклонить приглашение в команду")
    public ResponseEntity<Void> declineInvitation(@PathVariable Long id) {
        if (!securityService.canManageInvitation(id)) {
            throw new AccessDeniedException("Access Denied");
        }
        User currentUser = userService.getCurrentUserEntity();
        invitationService.declineInvitation(id, currentUser);
        return ResponseEntity.ok().build();
    }
}
