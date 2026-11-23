package com.holacafe.controller;

import com.holacafe.dto.TicketRevisionResponse;
import com.holacafe.service.ComandaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/comandas")
@RequiredArgsConstructor
public class ComandaController {
    private final ComandaService comandaService;

    // Solo Admin o Mesero pueden ver y auditar tickets del día
    // (RevisionTicketsView)
    @GetMapping("/tickets-dia")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<List<TicketRevisionResponse>> listarTicketsPorDia(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        LocalDate fechaConsulta = (fecha != null) ? fecha : LocalDate.now();
        return ResponseEntity.ok(comandaService.listarTicketsPorFecha(fechaConsulta));
    }

    // Cotejar o verificar un ticket
    @PatchMapping("/{id}/revisar")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<TicketRevisionResponse> alternarRevisado(@PathVariable String id) {
        return ResponseEntity.ok(comandaService.alternarRevisado(id));
    }

    // Cocina marca un platillo como listo (KDS)
    @PatchMapping("/detalles/{detalleId}/completar")
    @PreAuthorize("hasAnyAuthority('ROLE_COCINERO', 'ROLE_ADMINISTRADOR')")
    public ResponseEntity<Void> marcarPlatillo(
            @PathVariable Integer detalleId,
            @RequestParam boolean completado) {
        comandaService.marcarPlatilloCompletado(detalleId, completado);
        return ResponseEntity.noContent().build();
    }
}
