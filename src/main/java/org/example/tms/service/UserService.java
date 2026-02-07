package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.example.tms.dto.request.RegisterRequest;
import org.example.tms.dto.request.UpdateUserRequest;
import org.example.tms.dto.response.UserResponse;
import org.example.tms.entity.Role;
import org.example.tms.entity.User;
import org.example.tms.mapper.UserMapper;
import org.example.tms.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
@Transactional
public class  UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser() {
        User user = getCurrentUserEntity();
        return userMapper.toResponse(user);
    }

    public UserResponse updateProfile(UpdateUserRequest dto) {
        User user = getCurrentUserEntity();

        if (dto.getName() != null) {
            user.setName(dto.getName());
        }

        if (dto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userMapper.toResponse(user);
    }

    public void deleteCurrentUser() {
        User user = getCurrentUserEntity();
        userRepository.delete(user);
    }

    private User getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return userMapper.toResponse(user);
    }

    // register and login
    public UserResponse register(RegisterRequest dto) {

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.USER);

        return  userMapper.toResponse(userRepository.save(user));
    }
}





