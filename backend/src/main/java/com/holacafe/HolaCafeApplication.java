package com.holacafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class HolaCafeApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Mexico_City"));
        SpringApplication.run(HolaCafeApplication.class, args);
        System.out.println("HOLA CAFÉ corriendo en puerto 4000");
        System.out.println("Documentación: http://localhost:4000/api");
    }
}
