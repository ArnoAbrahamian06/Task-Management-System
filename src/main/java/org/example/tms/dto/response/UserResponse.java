package org.example.tms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.tms.entity.Role;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
