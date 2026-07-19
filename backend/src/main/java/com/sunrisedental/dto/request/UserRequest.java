package com.sunrisedental.dto.request;

import com.sunrisedental.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "Username is required")
    private String username;

    private String password; // optional on update

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    private String telephone;

    @NotNull(message = "Role is required")
    private Role role;

    private String profileImageUrl;

    private boolean isActive = true;
}
