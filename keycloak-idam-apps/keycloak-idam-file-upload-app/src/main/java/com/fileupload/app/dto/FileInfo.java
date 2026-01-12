package com.fileupload.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileInfo {

    private String id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private long size;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String downloadUrl;
}
