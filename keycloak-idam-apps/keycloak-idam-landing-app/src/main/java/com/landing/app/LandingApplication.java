package com.landing.app;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class LandingApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(LandingApplication.class, args);
        System.out.println("=================================================");
        System.out.println("Landing Application Started Successfully!");
        System.out.println("Backend API: http://localhost:8090/api");
        System.out.println("=================================================");
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}