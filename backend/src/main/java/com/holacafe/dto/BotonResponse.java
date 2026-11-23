package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BotonResponse {
    private String id;
    private String nombre;
    private String mesaId;
    private Integer mesaNumero;
    private Integer bateria;
    private String estado;
}
