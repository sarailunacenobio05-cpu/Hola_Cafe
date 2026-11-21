package com.holacafe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dispositivos_iot")
@Getter
@Setter
@NoArgsConstructor
public class Boton {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @Column(nullable = false)
    private Integer bateria = 100;

    @Column(nullable = false, length = 50)
    private String estado = "En línea";
}