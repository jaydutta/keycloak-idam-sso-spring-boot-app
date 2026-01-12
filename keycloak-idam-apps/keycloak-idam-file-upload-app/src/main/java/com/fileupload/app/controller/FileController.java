package com.fileupload.app.controller;



import com.fileupload.app.dto.FileInfo;
import com.fileupload.app.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@PreAuthorize("hasRole('file_user')")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileInfo> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            FileInfo fileInfo = fileStorageService.storeFile(file, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(fileInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<FileInfo>> getAllFiles(
            @AuthenticationPrincipal OidcUser principal) {
        String username = principal.getPreferredUsername();
        List<FileInfo> files = fileStorageService.getAllFiles(username);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<FileInfo> getFileInfo(
            @PathVariable String fileId,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            FileInfo fileInfo = fileStorageService.getFileInfo(fileId, username);
            return ResponseEntity.ok(fileInfo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileId,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            Resource resource = fileStorageService.loadFileAsResource(fileId, username);
            FileInfo fileInfo = fileStorageService.getFileInfo(fileId, username);

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + fileInfo.getOriginalFileName() + "\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @PathVariable String fileId,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            fileStorageService.deleteFile(fileId, username);
            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}