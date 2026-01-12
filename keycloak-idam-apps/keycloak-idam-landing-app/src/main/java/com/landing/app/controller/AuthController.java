package com.landing.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${keycloak.auth-server-url}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/user")
    public Map<String, Object> getUser(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return null;
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", principal.getPreferredUsername());
        userInfo.put("email", principal.getEmail());
        userInfo.put("firstName", principal.getGivenName());
        userInfo.put("lastName", principal.getFamilyName());
        userInfo.put("roles", principal.getAuthorities());
        
        return userInfo;
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            @AuthenticationPrincipal OidcUser principal) {
        
        // Invalidate session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Build Keycloak logout URL
        String logoutUrl = keycloakServerUrl + "/realms/" + realm + 
                          "/protocol/openid-connect/logout" +
                          "?post_logout_redirect_uri=" + frontendUrl +
                          "&client_id=landing-page-client";

        Map<String, String> response = new HashMap<>();
        response.put("logoutUrl", logoutUrl);
        response.put("message", "Logged out successfully");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public Map<String, Object> checkAuth(@AuthenticationPrincipal OidcUser principal) {
        Map<String, Object> result = new HashMap<>();
        result.put("authenticated", principal != null);
        if (principal != null) {
            result.put("username", principal.getPreferredUsername());
            result.put("roles", principal.getAuthorities());
        }
        return result;
    }
}