package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.AddMemberRequest;
import org.example.tms.dto.request.CreateTeamRequest;
import org.example.tms.dto.response.TeamMembershipResponse;
import org.example.tms.dto.response.TeamWithMembersResponse;
import org.example.tms.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Управление командами и участниками")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @Operation(summary = "Создать новую команду", description = "Текущий пользователь автоматически становится её тимлидом")
    public ResponseEntity<Void> createTeam(@RequestBody @Valid CreateTeamRequest request) {
        teamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/my")
    @Operation(summary = "Получить список команд, в которых состоит текущий пользователь")
    public ResponseEntity<List<TeamMembershipResponse>> getMyTeams() {
        // Возвращает список: Команда + позиция текущего юзера
        return ResponseEntity.ok(teamService.getMyTeams());
    }

    @GetMapping("/my-with-members")
    @Operation(summary = "Получить все команды пользователя вместе со списком всех коллег")
    public ResponseEntity<List<TeamWithMembersResponse>> getMyTeamsWithMembers() {
        // Возвращает развернутый список: Команда + список ВСЕХ участников этой команды
        return ResponseEntity.ok(teamService.getMyTeamsWithMembers());
    }

    @PreAuthorize("@securityService.canManageTeam(#teamId)")
    @PostMapping("/{teamId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long teamId,
            @RequestBody @Valid AddMemberRequest request) {

        teamService.addUserToTeam(teamId, request.getUserId(), request.getPosition());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
