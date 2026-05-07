package org.example.tms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;


@Getter
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;

    // Вместо owner и members теперь данные о команде
    private Long teamId;
    private String teamName;

    // Добавляем счетчики из твоей новой схемы
    private Integer tasksCount;
    private Integer completedCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}