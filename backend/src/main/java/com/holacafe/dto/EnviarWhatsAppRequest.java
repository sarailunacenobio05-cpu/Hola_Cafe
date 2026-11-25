package com.holacafe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnviarWhatsAppRequest {
    @NotBlank(message = "El número de teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El mensaje del ticket es obligatorio")
    private String mensaje;

    // Datos estructurados para generar el ticket PDF
    private Boolean enviarPdf = true;
    private String folio;
    private String mesa;
    private String mesero;
    private String metodoPago;
    private String fecha;
    private String subtotal;
    private Integer descuentoPct;
    private String descuento;
    private String iva;
    private Integer propinaPct;
    private String propina;
    private String total;
    private String resumen;
    private List<ItemTicket> items;

    @Getter
    @Setter
    public static class ItemTicket {
        private Integer cantidad;
        private String nombre;
        private String importe;
        private String detalle;
    }
}
