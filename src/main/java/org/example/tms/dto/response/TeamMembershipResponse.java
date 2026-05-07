package org.example.tms.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamMembershipResponse {
    private TeamResponse team;
    private String position;
    private LocalDateTime joinedAt;
}