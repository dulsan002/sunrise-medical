package com.sunrisedental.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sunrisedental.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
@Builder
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String username;
    
    @JsonIgnore
    private String password;
    
    private String fullName;
    private String email;
    private boolean isActive;
    private boolean isLocked;
    
    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        
        return UserDetailsImpl.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .isActive(user.isActive())
                .isLocked(user.isLocked())
                .authorities(Collections.singletonList(authority))
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
