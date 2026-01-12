package com.report.app.service;



import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import com.report.app.dto.ReportRequest;
import com.report.app.dto.ReportResponse;
import com.report.app.model.ReportData;

@Service
public class ReportService {

    @Value("${app.reports.storage-path}")
    private String storagePath;

    private final Map<String, ReportData> reportStore = new ConcurrentHashMap<>();

    public ReportResponse generateReport(ReportRequest request, String username) throws Exception {
        String reportId = UUID.randomUUID().toString();
        String fileName = generateFileName(request.getTitle(), request.getReportType());
        Path filePath = Paths.get(storagePath, fileName);

        // Create storage directory if it doesn't exist
        Files.createDirectories(filePath.getParent());

        // Generate report based on type
        switch (request.getReportType().toUpperCase()) {
            case "PDF":
                generatePDF(filePath, request);
                break;
            case "EXCEL":
                generateExcel(filePath, request);
                break;
            case "CSV":
                generateCSV(filePath, request);
                break;
            default:
                throw new IllegalArgumentException("Unsupported report type: " + request.getReportType());
        }

        long fileSize = Files.size(filePath);

        // Store report data
        ReportData reportData = ReportData.builder()
            .id(reportId)
            .title(request.getTitle())
            .description(request.getDescription())
            .reportType(request.getReportType())
            .fileName(fileName)
            .filePath(filePath.toString())
            .createdBy(username)
            .createdAt(LocalDateTime.now())
            .fileSize(fileSize)
            .metadata(request.getData())
            .build();

        reportStore.put(reportId, reportData);

        return mapToResponse(reportData);
    }

    public java.util.List<ReportResponse> getAllReports(String username) {
        return reportStore.values().stream()
            .filter(report -> report.getCreatedBy().equals(username))
            .map(this::mapToResponse)
            .sorted(Comparator.comparing(ReportResponse::getCreatedAt).reversed())
            .collect(Collectors.toList());
    }

    public ReportResponse getReportById(String reportId, String username) {
        ReportData report = reportStore.get(reportId);
        if (report == null || !report.getCreatedBy().equals(username)) {
            throw new RuntimeException("Report not found");
        }
        return mapToResponse(report);
    }

    public Resource downloadReport(String reportId, String username) throws IOException {
        ReportData report = reportStore.get(reportId);
        if (report == null || !report.getCreatedBy().equals(username)) {
            throw new RuntimeException("Report not found");
        }

        Path path = Paths.get(report.getFilePath());
        Resource resource = new UrlResource(path.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read the report file");
        }
    }

    public void deleteReport(String reportId, String username) throws IOException {
        ReportData report = reportStore.get(reportId);
        if (report == null || !report.getCreatedBy().equals(username)) {
            throw new RuntimeException("Report not found");
        }

        Path path = Paths.get(report.getFilePath());
        Files.deleteIfExists(path);
        reportStore.remove(reportId);
    }

    private void generatePDF(Path filePath, ReportRequest request) throws DocumentException, IOException {
        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(filePath.toFile()));
        document.open();

        // Title
        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(
        		com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD);
        Paragraph title = new Paragraph(request.getTitle(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        // Description
        if (request.getDescription() != null) {
            document.add(new Paragraph(request.getDescription()));
            document.add(new Paragraph(" "));
        }

        // Metadata
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
        document.add(new Paragraph(" "));

        // Data Table
        if (request.getData() != null && !request.getData().isEmpty()) {
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);

            PdfPCell headerCell1 = new PdfPCell(new Phrase("Field"));
            PdfPCell headerCell2 = new PdfPCell(new Phrase("Value"));
            table.addCell(headerCell1);
            table.addCell(headerCell2);

            for (Map.Entry<String, Object> entry : request.getData().entrySet()) {
                table.addCell(entry.getKey());
                table.addCell(String.valueOf(entry.getValue()));
            }

            document.add(table);
        }

        document.close();
    }

    private void generateExcel(Path filePath, ReportRequest request) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(request.getTitle());

        // Create header style
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(request.getTitle());
        titleCell.setCellStyle(headerStyle);

        // Description
        if (request.getDescription() != null) {
            rowNum++;
            Row descRow = sheet.createRow(rowNum++);
            descRow.createCell(0).setCellValue(request.getDescription());
        }

        // Metadata
        rowNum++;
        Row metaRow = sheet.createRow(rowNum++);
        metaRow.createCell(0).setCellValue("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Data
        if (request.getData() != null && !request.getData().isEmpty()) {
            rowNum++;
            Row headerRow = sheet.createRow(rowNum++);
            Cell headerCell1 = headerRow.createCell(0);
            headerCell1.setCellValue("Field");
            headerCell1.setCellStyle(headerStyle);
            
            Cell headerCell2 = headerRow.createCell(1);
            headerCell2.setCellValue("Value");
            headerCell2.setCellStyle(headerStyle);

            for (Map.Entry<String, Object> entry : request.getData().entrySet()) {
                Row dataRow = sheet.createRow(rowNum++);
                dataRow.createCell(0).setCellValue(entry.getKey());
                dataRow.createCell(1).setCellValue(String.valueOf(entry.getValue()));
            }
        }

        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        // Write to file
        try (FileOutputStream outputStream = new FileOutputStream(filePath.toFile())) {
            workbook.write(outputStream);
        }
        workbook.close();
    }

    private void generateCSV(Path filePath, ReportRequest request) throws IOException {
        try (CSVWriter writer = new CSVWriter(new FileWriter(filePath.toFile()))) {
            // Title
            writer.writeNext(new String[]{request.getTitle()});
            writer.writeNext(new String[]{""});

            // Description
            if (request.getDescription() != null) {
                writer.writeNext(new String[]{request.getDescription()});
                writer.writeNext(new String[]{""});
            }

            // Metadata
            writer.writeNext(new String[]{"Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)});
            writer.writeNext(new String[]{""});

            // Headers
            writer.writeNext(new String[]{"Field", "Value"});

            // Data
            if (request.getData() != null) {
                for (Map.Entry<String, Object> entry : request.getData().entrySet()) {
                    writer.writeNext(new String[]{entry.getKey(), String.valueOf(entry.getValue())});
                }
            }
        }
    }

    private String generateFileName(String title, String type) {
        String sanitizedTitle = title.replaceAll("[^a-zA-Z0-9]", "_");
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String extension = getFileExtension(type);
        return String.format("%s_%s%s", sanitizedTitle, timestamp, extension);
    }

    private String getFileExtension(String type) {
        switch (type.toUpperCase()) {
            case "PDF": return ".pdf";
            case "EXCEL": return ".xlsx";
            case "CSV": return ".csv";
            default: return ".txt";
        }
    }

    private ReportResponse mapToResponse(ReportData data) {
        return ReportResponse.builder()
            .id(data.getId())
            .title(data.getTitle())
            .description(data.getDescription())
            .reportType(data.getReportType())
            .fileName(data.getFileName())
            .createdBy(data.getCreatedBy())
            .createdAt(data.getCreatedAt())
            .fileSize(data.getFileSize())
            .build();
    }
}