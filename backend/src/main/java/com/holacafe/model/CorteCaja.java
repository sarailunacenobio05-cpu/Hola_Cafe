package com.holacafe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cortes_caja")
@Getter
@Setter
@NoArgsConstructor
public class CorteCaja {

    @Id
    @Column(length = 50)
    private String folio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Usuario responsable;

    @Column(name = "total_ventas", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVentas = BigDecimal.ZERO;

    @Column(name = "monto_efectivo", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoEfectivo = BigDecimal.ZERO;

    @Column(name = "monto_tarjeta", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTarjeta = BigDecimal.ZERO;

    @Column(name = "monto_transferencia_qr", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTransferenciaQr = BigDecimal.ZERO;

    @Column(name = "total_tickets", nullable = false)
    private Integer totalTickets = 0;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false)
    private LocalDateTime fecha;
}