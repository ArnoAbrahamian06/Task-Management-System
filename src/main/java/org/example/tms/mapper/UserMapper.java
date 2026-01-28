package org.example.tms.mapper;

import org.example.tms.dto.UserShortDto;
import org.example.tms.dto.request.CreateUserRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(CreateUserRequest dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    public UserShortDto toShortDto(User user) {
        return new UserShortDto(
                user.getId(),
                user.getEmail()
        );
    }
}
