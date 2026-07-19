package com.sunrisedental.controller;

import com.sunrisedental.entity.RolePermission;
import com.sunrisedental.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role-permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RolePermission>> getAllPermissions() {
        return ResponseEntity.ok(rolePermissionService.getAllPermissions());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RolePermission>> updatePermissions(@RequestBody List<RolePermission> permissions) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(rolePermissionService.updatePermissions(permissions, username));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RolePermission>> getMyPermissions() {
        String roleStr = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority();
        if (roleStr.startsWith("ROLE_")) {
            roleStr = roleStr.substring(5);
        }
        com.sunrisedental.entity.enums.Role role = com.sunrisedental.entity.enums.Role.valueOf(roleStr);
        return ResponseEntity.ok(rolePermissionService.getPermissionsByRole(role));
    }
}
