package com.landing.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.landing.app.dto.UserInfo;
import com.landing.app.dto.UserUpdateRequest;
import com.landing.app.service.KeycloakAdminService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api")
public class UserController {

    private final KeycloakAdminService keycloakAdminService;

    public UserController(KeycloakAdminService keycloakAdminService) {
        this.keycloakAdminService = keycloakAdminService;
    }

    @GetMapping("/user/profile")
    public UserInfo getProfile(@AuthenticationPrincipal OidcUser principal) {
        String username = principal.getPreferredUsername();
        return keycloakAdminService.getUserByUsername(username);
    }

    @PutMapping("/user/profile")
    public Map<String, String> updateProfile(
            @AuthenticationPrincipal OidcUser principal,
            @RequestBody UserUpdateRequest request) {
        
        String username = principal.getPreferredUsername();
        UserInfo user = keycloakAdminService.getUserByUsername(username);
        
        keycloakAdminService.updateUser(user.getId(), request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        return response;
    }

    @PostMapping("/user/change-password")
    public Map<String, String> changePassword(
            @AuthenticationPrincipal OidcUser principal,
            @RequestBody Map<String, String> passwordData) {
        
        String username = principal.getPreferredUsername();
        UserInfo user = keycloakAdminService.getUserByUsername(username);
        String newPassword = passwordData.get("newPassword");
        
        keycloakAdminService.resetPassword(user.getId(), newPassword);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return response;
    }

    @GetMapping("/user/info")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OidcUser principal) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", principal.getPreferredUsername());
        userInfo.put("email", principal.getEmail());
        userInfo.put("firstName", principal.getGivenName());
        userInfo.put("lastName", principal.getFamilyName());
        userInfo.put("roles", principal.getAuthorities());
        return userInfo;
    }
    
    @GetMapping("/user")
    public Map<String, Object> getUser(@AuthenticationPrincipal OidcUser principal) {
        Map<String, Object> user = new HashMap<>();
        
        if (principal != null) {
            user.put("name", principal.getAttribute("name"));
            user.put("username", principal.getAttribute("preferred_username"));
            user.put("email", principal.getAttribute("email"));
            
            // Extract roles
            List<String> roles = principal.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toList());
            user.put("roles", roles);
        }
        
        return user;
    }
}