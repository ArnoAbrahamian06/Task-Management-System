package org.example.tms.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.UpdateUserRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteProfile() {
        userService.deleteCurrentUser();
        return ResponseEntity.noContent().build();
    }
}
