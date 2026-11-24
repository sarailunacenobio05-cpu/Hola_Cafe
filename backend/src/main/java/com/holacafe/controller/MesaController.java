package com.holacafe.controller;

import com.holacafe.dto.AlertaResponse;
import com.holacafe.dto.BotonResponse;
import com.holacafe.dto.GuardarBotonRequest;
import com.holacafe.dto.MesaResponse;
import com.holacafe.service.MesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/mesas")
@RequiredArgsConstructor
public class MesaController {
    private final MesaService mesaService;
    // Listar mapa de mesas (Meseros, Cajeros y Admins)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<List<MesaResponse>> listarMesas() {
        return ResponseEntity.ok(mesaService.listarTodas());
    }
    // Cambiar estado de una mesa (ej: OCUPADA, LIBRE)
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<MesaResponse> cambiarEstado(
            @PathVariable String id,
            @RequestParam String estado) {
        return ResponseEntity.ok(mesaService.cambiarEstado(id, estado));
    }
    // Listar botones IoT asociados a las mesas
    @GetMapping("/botones")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<List<BotonResponse>> listarBotones() {
        return ResponseEntity.ok(mesaService.listarBotones());
    }

    // Crear un nuevo botón IoT (Solo Administrador)
    @PostMapping("/botones")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<BotonResponse> crearBoton(@Valid @RequestBody GuardarBotonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.crearBoton(request));
    }

    // Actualizar un botón IoT existente (Solo Administrador)
    @PutMapping("/botones/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<BotonResponse> actualizarBoton(
            @PathVariable String id,
            @Valid @RequestBody GuardarBotonRequest request) {
        return ResponseEntity.ok(mesaService.actualizarBoton(id, request));
    }

    // Eliminar un botón IoT (Solo Administrador)
    @DeleteMapping("/botones/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarBoton(@PathVariable String id) {
        mesaService.eliminarBoton(id);
        return ResponseEntity.noContent().build();
    }
    // Listar alertas activas (Llamadas a mesero o cuenta)
    @GetMapping("/alertas")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<List<AlertaResponse>> listarAlertasActivas() {
        return ResponseEntity.ok(mesaService.listarAlertasActivas());
    }
    // Marcar alerta como atendida
    @PatchMapping("/alertas/{id}/atender")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<AlertaResponse> atenderAlerta(@PathVariable Integer id) {
        return ResponseEntity.ok(mesaService.atenderAlerta(id));
    }
    @PostMapping("/{id}/llamar")
    public ResponseEntity<AlertaResponse> registrarLlamada(@PathVariable String id) {
        return ResponseEntity.ok(mesaService.registrarLlamada(id));
    }
}

