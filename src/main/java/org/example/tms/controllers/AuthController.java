package org.example.tms.controllers;

import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.RegisterRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.service.UserService;
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
    public UserResponse register(@RequestBody RegisterRequest dto) {
        return userService.register(dto);
    }
}
