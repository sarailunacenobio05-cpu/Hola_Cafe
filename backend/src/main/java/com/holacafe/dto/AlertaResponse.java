package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertaResponse {
    private Integer id;
    private String dispositivoId;
    private String mesaId;
    private Integer mesaNumero;
    private String usuarioId;
    private Boolean estado;
    private LocalDateTime fecha;
}
