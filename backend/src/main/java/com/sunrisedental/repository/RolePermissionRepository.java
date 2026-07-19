package com.sunrisedental.repository;

import com.sunrisedental.entity.RolePermission;
import com.sunrisedental.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(Role role);
    Optional<RolePermission> findByRoleAndResource(Role role, String resource);
}
