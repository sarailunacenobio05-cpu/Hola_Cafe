package com.holacafe.controller;

import com.holacafe.dto.EnviarWhatsAppRequest;
import com.holacafe.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final WhatsAppService whatsAppService;

    @PostMapping("/whatsapp")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRADOR', 'ROLE_MESERO')")
    public ResponseEntity<Map<String, Object>> enviarWhatsApp(@Valid @RequestBody EnviarWhatsAppRequest request) {
        return ResponseEntity.ok(whatsAppService.enviarMensajeWhatsApp(request));
    }
}
