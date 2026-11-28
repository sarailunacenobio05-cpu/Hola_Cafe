package com.holacafe.controller;

import com.holacafe.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerEstado(
            @RequestParam(defaultValue = "0") long sinceVersion) {
        return ResponseEntity.ok(syncService.obtenerCambios(sinceVersion));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> actualizarEstado(
            @RequestBody Map<String, Object> body) {
        Object cambiosObj = body != null ? body.get("cambios") : null;
        if (!(cambiosObj instanceof Map<?, ?> rawMap)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el objeto 'cambios'"));
        }

        Map<String, String> cambios = new java.util.HashMap<>();
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            if (entry.getKey() != null && entry.getValue() != null) {
                cambios.put(String.valueOf(entry.getKey()), String.valueOf(entry.getValue()));
            }
        }
        return ResponseEntity.ok(syncService.guardarCambios(cambios));
    }
}
