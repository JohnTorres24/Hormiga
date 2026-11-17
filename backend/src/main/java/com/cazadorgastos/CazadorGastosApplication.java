package com.cazadorgastos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CazadorGastosApplication {

    public static void main(String[] args) {
        SpringApplication.run(CazadorGastosApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🚀 Backend Cazador de Gastos Hormiga ACTIVO (Spring Boot / IntelliJ)");
        System.out.println("==================================================================");
    }
}
