package org.example.tms.mapper;

import org.example.tms.dto.request.CreateTaskRequest;
import org.example.tms.dto.request.UpdateTaskRequest;
import org.example.tms.dto.response.TaskResponse;
import org.example.tms.entity.*;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        // Убедитесь, что UserMapper умеет превращать User в UserShortDto
        uses = {ProjectMapper.class, UserMapper.class, SubtaskMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TaskMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "status", constant = "NEW")
    @Mapping(target = "project", source = "project")
    @Mapping(target = "assignee", source = "assignee")
    @Mapping(target = "title", source = "dto.title")
    @Mapping(target = "description", source = "dto.description")
    Task toEntity(CreateTaskRequest dto, Project project, TeamMember assignee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "assignee", ignore = true) // Мапим вручную в сервисе по ID
    @Mapping(target = "subtasks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "creator", ignore = true)
    void updateEntityFromDto(UpdateTaskRequest dto, @MappingTarget Task task);

    @Mapping(target = "project", source = "task.project")
    @Mapping(target = "assignee", source = "task.assignee.user")
    @Mapping(target = "creator", source = "task.creator")
    TaskResponse toResponse(Task task);
}