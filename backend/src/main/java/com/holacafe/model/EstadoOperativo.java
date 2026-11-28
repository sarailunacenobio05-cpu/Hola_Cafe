package com.holacafe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "estado_operativo")
@Getter
@Setter
@NoArgsConstructor
public class EstadoOperativo {

    @Id
    @Column(length = 64)
    private String clave;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String valor;

    @Column(nullable = false)
    private Long version = 1L;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn = LocalDateTime.now();
}
