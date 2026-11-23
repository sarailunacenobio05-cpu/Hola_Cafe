package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BotonResponse {
    private String id;
    private String mesaId;
    private Integer mesaNumero;
    private String tipo;
    private Integer bateria;
    private String estado;
    private LocalDateTime ultimoPing;
}