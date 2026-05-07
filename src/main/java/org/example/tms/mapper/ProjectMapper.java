package org.example.tms.mapper;

import org.example.tms.dto.ProjectShortDto;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.request.UpdateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.entity.Project;
import org.example.tms.entity.Team;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    // Маппинг из DTO и объекта Team в сущность Project
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tasksCount", constant = "0L")
    @Mapping(target = "completedCount", constant = "0L")
    @Mapping(target = "team", source = "team")
    @Mapping(target = "name", source = "dto.name")
    @Mapping(target = "description", source = "dto.description")
    Project toEntity(CreateProjectRequest dto, Team team);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "tasksCount", ignore = true)
    @Mapping(target = "completedCount", ignore = true)
    void updateEntityFromDto(UpdateProjectRequest dto, @MappingTarget Project project);

    // Маппинг из сущности в Response
    @Mapping(target = "teamId", source = "project.team.id")
    @Mapping(target = "teamName", source = "project.team.name")
    @Mapping(target = "tasksCount", source = "project.tasksCount")
    @Mapping(target = "completedCount", source = "project.completedCount")
    ProjectResponse toResponse(Project project);

    ProjectShortDto toShortDto(Project project);
}