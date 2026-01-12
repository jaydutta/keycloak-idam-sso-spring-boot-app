package com.report.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportData {
    private String id;
    private String title;
    private String description;
    private String reportType;
    private String fileName;
    private String filePath;
    private String createdBy;
    private LocalDateTime createdAt;
    private long fileSize;
    private Map<String, Object> metadata;
}
