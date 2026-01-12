package com.fileupload.app.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fileupload.app.dto.FileInfo;
import com.fileupload.app.exception.FileStorageException;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path fileStorageLocation;
    private final Map<String, FileInfo> fileStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    public FileInfo storeFile(MultipartFile file, String username) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Invalid filename: " + originalFileName);
            }

            String fileId = UUID.randomUUID().toString();
            String fileName = fileId + "_" + originalFileName;
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileInfo fileInfo = FileInfo.builder()
                .id(fileId)
                .fileName(fileName)
                .originalFileName(originalFileName)
                .contentType(file.getContentType())
                .size(file.getSize())
                .uploadedBy(username)
                .uploadedAt(LocalDateTime.now())
                .downloadUrl("/api/files/" + fileId + "/download")
                .build();

            fileStore.put(fileId, fileInfo);
            return fileInfo;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file " + originalFileName, ex);
        }
    }

    public Resource loadFileAsResource(String fileId, String username) {
        try {
            FileInfo fileInfo = fileStore.get(fileId);
            if (fileInfo == null || !fileInfo.getUploadedBy().equals(username)) {
                throw new FileStorageException("File not found");
            }

            Path filePath = this.fileStorageLocation.resolve(fileInfo.getFileName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new FileStorageException("File not found");
            }
        } catch (MalformedURLException ex) {
            throw new FileStorageException("File not found", ex);
        }
    }

    public List<FileInfo> getAllFiles(String username) {
        return fileStore.values().stream()
            .filter(file -> file.getUploadedBy().equals(username))
            .sorted(Comparator.comparing(FileInfo::getUploadedAt).reversed())
            .collect(Collectors.toList());
    }

    public FileInfo getFileInfo(String fileId, String username) {
        FileInfo fileInfo = fileStore.get(fileId);
        if (fileInfo == null || !fileInfo.getUploadedBy().equals(username)) {
            throw new FileStorageException("File not found");
        }
        return fileInfo;
    }

    public void deleteFile(String fileId, String username) {
        FileInfo fileInfo = fileStore.get(fileId);
        if (fileInfo == null || !fileInfo.getUploadedBy().equals(username)) {
            throw new FileStorageException("File not found");
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(fileInfo.getFileName()).normalize();
            Files.deleteIfExists(filePath);
            fileStore.remove(fileId);
        } catch (IOException ex) {
            throw new FileStorageException("Failed to delete file", ex);
        }
    }
}