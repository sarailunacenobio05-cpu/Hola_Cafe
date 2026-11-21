package com.holacafe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "opciones_producto")
@Getter
@Setter
@NoArgsConstructor
public class OpcionProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private ProductoMenu producto;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "precio_extra", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioExtra = BigDecimal.ZERO;
}