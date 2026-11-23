package com.holacafe.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CorteCajaResponse {
    private String folio;
    private String responsableId;
    private String responsableNombre;
    private BigDecimal totalVentas;
    private BigDecimal montoEfectivo;
    private BigDecimal montoTarjeta;
    private BigDecimal montoTransferenciaQr;
    private Integer totalTickets;
    private String observaciones;
    private LocalDateTime fecha;
}
