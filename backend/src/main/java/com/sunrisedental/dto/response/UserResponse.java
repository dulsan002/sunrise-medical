package com.sunrisedental.dto.response;

import com.sunrisedental.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String telephone;
    private Role role;
    private String profileImageUrl;
    private boolean isActive;
}
