package com.holacafe.controller;
import com.holacafe.dto.CorteCajaResponse;
import com.holacafe.dto.RegistrarCorteRequest;
import com.holacafe.service.CorteCajaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
@RestController
@RequestMapping("/cortes-caja")
@RequiredArgsConstructor
public class CorteCajaController {
    private final CorteCajaService corteCajaService;
    // Listar todos los cortes acumulados (Solo Administrador)
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<List<CorteCajaResponse>> listarCortes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        if (fecha != null) {
            return ResponseEntity.ok(corteCajaService.listarPorFecha(fecha));
        }
        return ResponseEntity.ok(corteCajaService.listarTodos());
    }

    // Listar cortes paginados
    @GetMapping("/paginado")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<java.util.Map<String, Object>> listarPaginado(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(corteCajaService.listarPaginado(page, size, fecha));
    }
    // Registrar nuevo corte de turno/caja (Admin o Cajero)
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<CorteCajaResponse> registrarCorte(
            @Valid @RequestBody RegistrarCorteRequest request,
            Authentication authentication) {
        String correoResponsable = authentication.getName();
        CorteCajaResponse corte = corteCajaService.registrarCorte(request, correoResponsable);
        return ResponseEntity.status(HttpStatus.CREATED).body(corte);
    }
}

