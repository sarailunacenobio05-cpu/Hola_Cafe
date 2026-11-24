package com.holacafe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuardarBotonRequest {
    @NotBlank(message = "El identificador del botón es obligatorio")
    private String id;

    @NotBlank(message = "El nombre del botón es obligatorio")
    private String nombre;

    private String mesaId;
    private Integer bateria;
    private String estado;
}
