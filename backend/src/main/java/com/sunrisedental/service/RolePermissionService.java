package com.sunrisedental.service;

import com.sunrisedental.entity.RolePermission;
import com.sunrisedental.entity.enums.AuditAction;
import com.sunrisedental.entity.enums.Role;
import com.sunrisedental.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final AuditLogService auditLogService;

    public List<RolePermission> getAllPermissions() {
        return rolePermissionRepository.findAll();
    }

    public List<RolePermission> getPermissionsByRole(Role role) {
        return rolePermissionRepository.findByRole(role);
    }

    public Optional<RolePermission> getPermissionByRoleAndResource(Role role, String resource) {
        return rolePermissionRepository.findByRoleAndResource(role, resource);
    }

    @Transactional
    public List<RolePermission> updatePermissions(List<RolePermission> permissions, String username) {
        for (RolePermission perm : permissions) {
            RolePermission existing = rolePermissionRepository.findByRoleAndResource(perm.getRole(), perm.getResource())
                    .orElse(RolePermission.builder()
                            .role(perm.getRole())
                            .resource(perm.getResource())
                            .build());

            String oldVal = String.format("{\"canCreate\":%b,\"canRead\":%b,\"canUpdate\":%b,\"canDelete\":%b}",
                    existing.isCanCreate(), existing.isCanRead(), existing.isCanUpdate(), existing.isCanDelete());

            existing.setCanCreate(perm.isCanCreate());
            existing.setCanRead(perm.isCanRead());
            existing.setCanUpdate(perm.isCanUpdate());
            existing.setCanDelete(perm.isCanDelete());

            rolePermissionRepository.save(existing);

            String newVal = String.format("{\"canCreate\":%b,\"canRead\":%b,\"canUpdate\":%b,\"canDelete\":%b}",
                    perm.isCanCreate(), perm.isCanRead(), perm.isCanUpdate(), perm.isCanDelete());

            auditLogService.log(
                    username,
                    AuditAction.UPDATE,
                    "ROLE_PERMISSION",
                    existing.getId(),
                    oldVal,
                    newVal,
                    "0.0.0.0"
            );
        }
        return rolePermissionRepository.findAll();
    }
}
