package com.report.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Map;

@Data
public class ReportRequest {
	
	@NotBlank
    private String reportType; // PDF, EXCEL, CSV
    
    @NotBlank
    private String title;
    
    private String description;
    private Map<String, Object> data;

}
