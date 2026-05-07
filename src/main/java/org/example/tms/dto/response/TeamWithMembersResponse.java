package org.example.tms.dto.response;

import lombok.Data;
import org.example.tms.dto.MemberDetailsDto;

import java.util.List;

@Data
public class TeamWithMembersResponse {
    private Long teamId;
    private String teamName;
    private List<MemberDetailsDto> members;
}