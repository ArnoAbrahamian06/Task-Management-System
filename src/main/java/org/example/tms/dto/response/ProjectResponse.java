package org.example.tms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.tms.dto.UserShortDto;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;

    private UserShortDto owner;
    private Set<UserShortDto> members;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
