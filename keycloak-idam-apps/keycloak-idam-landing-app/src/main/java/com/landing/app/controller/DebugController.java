package com.landing.app.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/token-claims")
    public Map<String, Object> getTokenClaims(@AuthenticationPrincipal OidcUser principal) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", principal.getPreferredUsername());
        response.put("email", principal.getEmail());
        response.put("authorities", principal.getAuthorities());
        response.put("all_claims", principal.getClaims());
        log.info("File upload request from user: {}, filename: ", response);
        
        return response;
    }
}
