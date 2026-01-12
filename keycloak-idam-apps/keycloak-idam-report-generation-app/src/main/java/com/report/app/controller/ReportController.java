package com.report.app.controller;


import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.report.app.dto.ReportRequest;
import com.report.app.dto.ReportResponse;
import com.report.app.service.ReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('report_user')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ReportResponse> generateReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            ReportResponse response = reportService.generateReport(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports(
            @AuthenticationPrincipal OidcUser principal) {
        String username = principal.getPreferredUsername();
        List<ReportResponse> reports = reportService.getAllReports(username);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ReportResponse> getReportById(
            @PathVariable String reportId,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            ReportResponse report = reportService.getReportById(reportId, username);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{reportId}/download")
    public ResponseEntity<Resource> downloadReport(
            @PathVariable String reportId,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            Resource resource = reportService.downloadReport(reportId, username);
            ReportResponse report = reportService.getReportById(reportId, username);

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + report.getFileName() + "\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable String reportId,
            @AuthenticationPrincipal OidcUser principal) {
        try {
            String username = principal.getPreferredUsername();
            reportService.deleteReport(reportId, username);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}