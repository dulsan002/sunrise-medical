package com.sunrisedental.security;

import com.sunrisedental.entity.RolePermission;
import com.sunrisedental.entity.enums.Role;
import com.sunrisedental.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final RolePermissionRepository rolePermissionRepository;

    public boolean hasPermission(String resource, String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        
        // Find the role (strip "ROLE_" prefix if present, but UserDetailsImpl creates simple ROLE_ role)
        String authority = authentication.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("");

        String roleStr = authority.replace("ROLE_", "");
        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            return false;
        }

        Optional<RolePermission> optPermission = rolePermissionRepository.findByRoleAndResource(role, resource.toUpperCase());
        if (optPermission.isEmpty()) {
            return false;
        }

        RolePermission permission = optPermission.get();
        switch (action.toUpperCase()) {
            case "CREATE":
                return permission.isCanCreate();
            case "READ":
                return permission.isCanRead();
            case "UPDATE":
                return permission.isCanUpdate();
            case "DELETE":
                return permission.isCanDelete();
            default:
                return false;
        }
    }
}
