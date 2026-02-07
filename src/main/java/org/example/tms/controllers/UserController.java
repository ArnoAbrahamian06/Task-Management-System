package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.UpdateUserRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.service.UserService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMe() {
        return userService.getCurrentUser();
    }

    @PutMapping("/me")
    public UserResponse updateMe(@RequestBody @Valid UpdateUserRequest dto) {
        return userService.updateProfile(dto);
    }

    @DeleteMapping("/me")
    public void deleteMe() {
        userService.deleteCurrentUser();
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
