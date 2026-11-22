package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponse {
    private String id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String estado;
    private String categoria;
    private Integer categoriaId;
    private Boolean permiteNotasCocina;
    private List<OpcionResponse> opciones;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpcionResponse {
        private Integer id;
        private String nombre;
        private BigDecimal precioExtra;
    }
}
