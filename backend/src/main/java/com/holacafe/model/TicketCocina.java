package com.holacafe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets_cocina")
@Getter
@Setter
@NoArgsConstructor
public class TicketCocina {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    private OrdenComanda orden;

    @Column(nullable = false, length = 50)
    private String estado = "Nuevas";

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
}