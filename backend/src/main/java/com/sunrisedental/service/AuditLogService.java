package com.sunrisedental.service;

import com.sunrisedental.entity.AuditLog;
import com.sunrisedental.entity.enums.AuditAction;
import com.sunrisedental.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String username, AuditAction action, String entityType, Long entityId, String oldVal, String newVal, String ip) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValues(oldVal)
                .newValues(newVal)
                .ipAddress(ip)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);
    }
}
