package com.report.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/user")
    public Map<String, Object> getUser(@AuthenticationPrincipal OidcUser principal) {
        Map<String, Object> user = new HashMap<>();
        
        if (principal != null) {
            user.put("name", principal.getAttribute("name"));
            user.put("username", principal.getAttribute("preferred_username"));
            user.put("email", principal.getAttribute("email"));
            
            List<String> roles = principal.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toList());
            user.put("roles", roles);
        }
        
        return user;
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
}