package org.example.tms.mapper;

import org.example.tms.dto.response.TeamMembershipResponse;
import org.example.tms.dto.response.TeamResponse;
import org.example.tms.entity.Team;
import org.example.tms.entity.TeamMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TeamMapper {

    @Mapping(target = "description", ignore = true)
    TeamResponse toTeamResponse(Team team);

    @Mapping(target = "team", source = "team")
    @Mapping(target = "position", source = "position")
    @Mapping(target = "joinedAt", source = "joinedAt")
    TeamMembershipResponse toMembershipResponse(TeamMember teamMember);
}
