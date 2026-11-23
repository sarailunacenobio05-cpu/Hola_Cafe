package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MesaResponse {
    private String id;
    private Integer numero;
    private Integer capacidad;
    private String estado;
    private Integer posicionX;
    private Integer posicionY;
    private String meseroId;
    private String meseroNombre;
    private String comandaActivaId;
    private BigDecimal totalComandaActiva;
}