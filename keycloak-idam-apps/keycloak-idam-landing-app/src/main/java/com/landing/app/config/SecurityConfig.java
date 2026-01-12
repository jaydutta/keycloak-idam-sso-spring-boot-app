package com.landing.app.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                //.requestMatchers("/api/public/**", "/actuator/**", "/login/**", "/oauth2/**").permitAll()
               // .requestMatchers("/api/admin/**").hasRole("admin")
            	.requestMatchers("/api/public/**", "/actuator/**", "/login/**", "/oauth2/**").permitAll()
                .requestMatchers("/api/admin/**").hasAnyRole("admin", "ADMIN") // Both cases
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.oidcUserService(oidcUserService()))
                .defaultSuccessUrl(frontendUrl, true)
                .failureUrl("/login?error")
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .logout(logout -> logout
                .logoutSuccessUrl(frontendUrl)
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }

    
    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        final OidcUserService delegate = new OidcUserService();

        return userRequest -> {
            try {
                OidcUser oidcUser = delegate.loadUser(userRequest);
                
                Set<GrantedAuthority> authorities = new HashSet<>();
                
                // Extract roles from ID token claims
                Map<String, Object> claims = oidcUser.getClaims();
                System.out.println("DEBUG: All claims: " + claims.keySet());
                
                extractRolesFromClaims(claims, authorities);
                
                // If no roles found, add default USER role
                if (authorities.isEmpty()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    System.out.println("DEBUG: No roles found, adding default ROLE_USER");
                }
                
                System.out.println("DEBUG: User " + oidcUser.getPreferredUsername() + " has authorities: " + authorities);
                
                return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
            } catch (Exception e) {
                System.err.println("ERROR: Failed to load user - " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        };
    }

    private void extractRolesFromClaims(Map<String, Object> claims, Set<GrantedAuthority> authorities) {
        try {
            // Extract from realm_access
            Object realmAccessObj = claims.get("realm_access");
            if (realmAccessObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> realmAccess = (Map<String, Object>) realmAccessObj;
                Object rolesObj = realmAccess.get("roles");
                
                if (rolesObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> roles = (List<String>) rolesObj;
                    System.out.println("DEBUG: Found realm_access roles: " + roles);
                    
                    roles.stream()
                        .filter(role -> !role.startsWith("default-") && 
                                      !role.startsWith("offline_") && 
                                      !role.startsWith("uma_"))
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .forEach(authorities::add);
                }
            }
            
            // Also extract from resource_access if present
            Object resourceAccessObj = claims.get("resource_access");
            if (resourceAccessObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resourceAccess = (Map<String, Object>) resourceAccessObj;
                
                // Check for client-specific roles
                Object clientRolesObj = resourceAccess.get("landing-page-client");
                if (clientRolesObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> clientRoles = (Map<String, Object>) clientRolesObj;
                    Object rolesObj = clientRoles.get("roles");
                    
                    if (rolesObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<String> roles = (List<String>) rolesObj;
                        System.out.println("DEBUG: Found resource_access client roles: " + roles);
                        
                        roles.stream()
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                            .forEach(authorities::add);
                    }
                }
            }
            
            System.out.println("DEBUG: Final extracted authorities: " + authorities);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to extract roles - " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Set<GrantedAuthority> authorities = new HashSet<>();
            
            try {
                // Extract from realm_access
                Map<String, Object> realmAccess = jwt.getClaim("realm_access");
                if (realmAccess != null && realmAccess.get("roles") != null) {
                    @SuppressWarnings("unchecked")
                    List<String> roles = (List<String>) realmAccess.get("roles");
                    
                    roles.stream()
                        .filter(role -> !role.startsWith("default-") && 
                                      !role.startsWith("offline_") && 
                                      !role.startsWith("uma_"))
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .forEach(authorities::add);
                }
                
                // Extract from resource_access
                Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
                if (resourceAccess != null) {
                    Object clientRolesObj = resourceAccess.get("landing-page-client");
                    if (clientRolesObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> clientRoles = (Map<String, Object>) clientRolesObj;
                        Object rolesObj = clientRoles.get("roles");
                        
                        if (rolesObj instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<String> roles = (List<String>) rolesObj;
                            
                            roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .forEach(authorities::add);
                        }
                    }
                }
                
                if (authorities.isEmpty()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                }
            } catch (Exception e) {
                System.err.println("ERROR: Failed to convert JWT authorities - " + e.getMessage());
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }
            
            return new ArrayList<>(authorities);
        });
        
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}