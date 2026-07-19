package com.sunrisedental.service;

import com.sunrisedental.entity.ClinicSetting;
import com.sunrisedental.repository.ClinicSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClinicSettingService {

    private final ClinicSettingRepository clinicSettingRepository;

    public List<ClinicSetting> getAllSettings() {
        return clinicSettingRepository.findAll();
    }

    @Transactional
    public ClinicSetting updateSetting(String key, String value, String updatedBy) {
        ClinicSetting setting = clinicSettingRepository.findBySettingKey(key)
                .orElse(ClinicSetting.builder()
                        .settingKey(key)
                        .category("GENERAL")
                        .build());
        
        setting.setSettingValue(value);
        setting.setUpdatedAt(LocalDateTime.now());
        setting.setUpdatedBy(updatedBy);
        
        return clinicSettingRepository.save(setting);
    }
}
