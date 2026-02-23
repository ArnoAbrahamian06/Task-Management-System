package org.example.tms.controllers;

import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.LoginRequest;
import org.example.tms.dto.request.RegisterRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        // Возвращает JWT токен в виде строки
        return ResponseEntity.ok(userService.login(request));
    }
}
