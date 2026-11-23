package com.holacafe.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class RegistrarCorteRequest {
    @NotNull(message = "El monto en efectivo es obligatorio")
    @DecimalMin(value = "0.0", message = "El monto no puede ser negativo")
    private BigDecimal montoEfectivo;
    @NotNull(message = "El monto con tarjeta es obligatorio")
    @DecimalMin(value = "0.0", message = "El monto no puede ser negativo")
    private BigDecimal montoTarjeta;
    @NotNull(message = "El monto por transferencia/QR es obligatorio")
    @DecimalMin(value = "0.0", message = "El monto no puede ser negativo")
    private BigDecimal montoTransferenciaQr;
    private String observaciones;
}
