package org.example.tms.mapper;

import org.example.tms.dto.request.SubtaskRequest;
import org.example.tms.dto.request.UpdateSubtaskRequest;
import org.example.tms.dto.response.SubtaskResponse;
import org.example.tms.entity.Subtask;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SubtaskMapper {

    // Превращаем DTO в сущность (поле task игнорируем, установим в сервисе)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "done", ignore = true)
    @Mapping(target = "task", ignore = true)
    Subtask toEntity(SubtaskRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(source = "completed", target = "done")
    void updateSubtaskFromDto(UpdateSubtaskRequest dto, @MappingTarget Subtask subtask);

    // Превращаем сущность в ответ для фронтенда
    @Mapping(source = "done", target = "completed")
    SubtaskResponse toResponse(Subtask subtask);
}