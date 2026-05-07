package org.example.tms.mapper;

import org.example.tms.dto.UserShortDto;
import org.example.tms.dto.request.CreateUserRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "teamMemberships", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    User toEntity(CreateUserRequest dto);

    UserResponse toResponse(User user);

    UserShortDto toShortDto(User user);
}