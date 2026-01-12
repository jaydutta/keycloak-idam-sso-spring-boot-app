package com.landing.app.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.landing.app.dto.UserCreateRequest;
import com.landing.app.dto.UserInfo;
import com.landing.app.dto.UserUpdateRequest;

import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class KeycloakAdminService {

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    @Value("${keycloak.admin.client-id}")
    private String adminClientId;

    private Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
            .serverUrl(serverUrl)
            .realm("master")
            .username(adminUsername)
            .password(adminPassword)
            .clientId(adminClientId)
            .build();
    }

    private RealmResource getRealmResource() {
        return getKeycloakInstance().realm(realm);
    }

    public List<UserInfo> getAllUsers() {
        UsersResource usersResource = getRealmResource().users();
        List<UserRepresentation> users = usersResource.list();
        
        return users.stream()
            .map(this::mapToUserInfo)
            .collect(Collectors.toList());
    }

    public com.landing.app.dto.UserInfo getUserById(String userId) {
        UserResource userResource = getRealmResource().users().get(userId);
        UserRepresentation user = userResource.toRepresentation();
        return mapToUserInfo(user);
    }

    public UserInfo getUserByUsername(String username) {
        UsersResource usersResource = getRealmResource().users();
        List<UserRepresentation> users = usersResource.search(username, true);
        
        if (users.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        return mapToUserInfo(users.get(0));
    }

    public String createUser(UserCreateRequest request) {
        UsersResource usersResource = getRealmResource().users();
        
        UserRepresentation user = new UserRepresentation();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(request.isEnabled());
        user.setEmailVerified(request.isEmailVerified());
        
        Response response = usersResource.create(user);
        
        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create user: " + response.getStatusInfo());
        }
        
        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
        
        // Set password
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(request.getPassword());
        credential.setTemporary(false);
        
        UserResource userResource = usersResource.get(userId);
        userResource.resetPassword(credential);
        
        // Assign roles
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            assignRolesToUser(userId, request.getRoles());
        }
        
        response.close();
        return userId;
    }

    public void updateUser(String userId, UserUpdateRequest request) {
        UserResource userResource = getRealmResource().users().get(userId);
        UserRepresentation user = userResource.toRepresentation();
        
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }
        
        userResource.update(user);
        
        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(request.getPassword());
            credential.setTemporary(false);
            userResource.resetPassword(credential);
        }
        
        // Update roles if provided
        if (request.getRoles() != null) {
            assignRolesToUser(userId, request.getRoles());
        }
    }

    public void deleteUser(String userId) {
        getRealmResource().users().get(userId).remove();
    }

    public void resetPassword(String userId, String newPassword) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);
        
        getRealmResource().users().get(userId).resetPassword(credential);
    }

    public void assignRolesToUser(String userId, List<String> roleNames) {
        UserResource userResource = getRealmResource().users().get(userId);
        
        // Remove existing realm roles
        List<RoleRepresentation> existingRoles = userResource.roles().realmLevel().listEffective();
        if (!existingRoles.isEmpty()) {
            userResource.roles().realmLevel().remove(existingRoles);
        }
        
        // Add new roles
        List<RoleRepresentation> rolesToAdd = roleNames.stream()
            .map(roleName -> {
                try {
                    return getRealmResource().roles().get(roleName).toRepresentation();
                } catch (Exception e) {
                    return null;
                }
            })
            .filter(role -> role != null)
            .collect(Collectors.toList());
        
        if (!rolesToAdd.isEmpty()) {
            userResource.roles().realmLevel().add(rolesToAdd);
        }
    }

    public List<String> getUserRoles(String userId) {
        UserResource userResource = getRealmResource().users().get(userId);
        return userResource.roles().realmLevel().listEffective().stream()
            .map(RoleRepresentation::getName)
            .collect(Collectors.toList());
    }

    public List<String> getAllRoles() {
        return getRealmResource().roles().list().stream()
            .map(RoleRepresentation::getName)
            .filter(role -> !role.startsWith("default-") && !role.startsWith("offline_") && !role.startsWith("uma_"))
            .collect(Collectors.toList());
    }

    private UserInfo mapToUserInfo(UserRepresentation user) {
        List<String> roles = Collections.emptyList();
        try {
            roles = getUserRoles(user.getId());
        } catch (Exception e) {
            // Ignore role fetching errors
        }
        
        return UserInfo.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .roles(roles)
            .emailVerified(user.isEmailVerified())
            .enabled(user.isEnabled())
            .build();
    }
}