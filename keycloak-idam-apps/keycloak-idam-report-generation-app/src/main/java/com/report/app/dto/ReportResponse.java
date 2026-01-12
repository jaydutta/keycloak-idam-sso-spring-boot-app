package com.report.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;
    private String title;
    private String description;
    private String reportType;
    private String fileName;
    private String createdBy;
    private LocalDateTime createdAt;
    private long fileSize;
}
