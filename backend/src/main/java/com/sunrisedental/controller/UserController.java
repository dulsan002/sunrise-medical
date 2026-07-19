package com.sunrisedental.controller;

import com.sunrisedental.dto.request.UserRequest;
import com.sunrisedental.dto.response.UserResponse;
import com.sunrisedental.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(userService.getUserByUsername(principal.getName()));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<String> uploadAvatar(Principal principal, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String url = userService.uploadProfileImage(principal.getName(), file);
        return ResponseEntity.ok(url);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(Principal principal, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @GetMapping
    @PreAuthorize("@securityService.hasPermission('USERS', 'READ')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('USERS', 'READ')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("@securityService.hasPermission('USERS', 'CREATE')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        return new ResponseEntity<>(userService.createUser(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('USERS', 'UPDATE')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('USERS', 'DELETE')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
