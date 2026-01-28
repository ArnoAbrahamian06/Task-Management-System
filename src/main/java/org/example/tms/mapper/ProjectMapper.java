package org.example.tms.mapper;

import lombok.RequiredArgsConstructor;
import org.example.tms.dto.ProjectShortDto;
import org.example.tms.dto.request.CreateProjectRequest;
import org.example.tms.dto.response.ProjectResponse;
import org.example.tms.entity.Project;
import org.example.tms.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProjectMapper {

    private final UserMapper userMapper;

    public Project toEntity(CreateProjectRequest dto, User owner) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setOwner(owner);
        return project;
    }

    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                userMapper.toShortDto(project.getOwner()),
                project.getMembers().stream()
                        .map(userMapper::toShortDto)
                        .collect(Collectors.toSet()),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public ProjectShortDto toShortDto(Project project) {
        return new ProjectShortDto(
                project.getId(),
                project.getName()
        );
    }
}
