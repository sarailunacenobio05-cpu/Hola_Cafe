package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketRevisionResponse {
    private String id;
    private Integer folio;
    private String mesa;
    private String mesero;
    private String estado;
    private String metodoPago;
    private BigDecimal subtotal;
    private BigDecimal descuentoPorcentaje;
    private BigDecimal propina;
    private BigDecimal total;
    private Boolean revisado;
    private LocalDateTime fecha;
    private List<LineaDetalleResponse> lineas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineaDetalleResponse {
        private Integer id;
        private String productoNombre;
        private String opcionNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
        private String notas;
        private Boolean completado;
    }
}
