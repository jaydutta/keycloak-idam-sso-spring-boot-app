package com.report.app;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class ReportApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ReportApplication.class, args);
        System.out.println("=================================================");
        System.out.println("Report Generation Application Started Successfully!");
        System.out.println("Backend API: http://localhost:8091/api");
        System.out.println("=================================================");
    }
}