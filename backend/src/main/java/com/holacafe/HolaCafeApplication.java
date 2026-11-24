package com.holacafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HolaCafeApplication {

    public static void main(String[] args) {
        SpringApplication.run(HolaCafeApplication.class, args);
        System.out.println("HOLA CAFÉ corriendo en puerto 4000");
        System.out.println("Documentación: http://localhost:4000/api");
    }
}
