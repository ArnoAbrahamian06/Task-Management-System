package org.example.tms.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InvitationResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long inviterId;
    private String inviterName;
    private String position;
    private String status;
    private LocalDateTime createdAt;
}
