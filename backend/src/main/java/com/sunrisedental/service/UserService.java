package com.sunrisedental.service;

import com.sunrisedental.dto.request.UserRequest;
import com.sunrisedental.dto.response.UserResponse;
import com.sunrisedental.entity.User;
import com.sunrisedental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .role(request.getRole())
                .profileImageUrl(request.getProfileImageUrl())
                .isActive(request.isActive())
                .build();

        User saved = userRepository.save(user);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "User", saved.getUserId(), null, String.format("{\"username\":\"%s\"}", saved.getUsername()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String oldUsername = user.getUsername();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setTelephone(request.getTelephone());
        user.setRole(request.getRole());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setActive(request.isActive());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "User", saved.getUserId(), String.format("{\"username\":\"%s\"}", oldUsername), String.format("{\"username\":\"%s\"}", saved.getUsername()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateProfile(String username, UserRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setTelephone(request.getTelephone());
        user.setProfileImageUrl(request.getProfileImageUrl());
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        User saved = userRepository.save(user);
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "UserProfile", saved.getUserId(), String.format("{\"username\":\"%s\"}", username), String.format("{\"username\":\"%s\"}", username), null);
        return mapToResponse(saved);
    }

    @Transactional
    public String uploadProfileImage(String username, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        try {
            Path uploadPath = Paths.get("uploads", "profiles");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);
            
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "/api/v1/uploads/profiles/" + fileName;
            user.setProfileImageUrl(fileUrl);
            userRepository.save(user);
            
            return fileUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "User", id, String.format("{\"username\":\"%s\"}", user.getUsername()), null, null);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(user.isActive())
                .build();
    }
}
