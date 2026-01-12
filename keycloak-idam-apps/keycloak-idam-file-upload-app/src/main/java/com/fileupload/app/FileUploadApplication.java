package com.fileupload.app;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class FileUploadApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(FileUploadApplication.class, args);
        System.out.println("=================================================");
        System.out.println("File Upload Application Started Successfully!");
        System.out.println("Backend API: http://localhost:8092/api");
        System.out.println("=================================================");
    }
}