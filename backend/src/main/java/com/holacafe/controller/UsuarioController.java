package com.holacafe.controller;

import com.holacafe.dto.UsuarioResponse;
import com.holacafe.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(usuarioService.listarFiltrados(search, estado));
    }

    @GetMapping("/paginado")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<java.util.Map<String, Object>> listarPaginado(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(usuarioService.listarPaginado(page, size, search, estado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable String id, Authentication authentication) {
        String correoAdmin = (authentication != null) ? authentication.getName() : null;
        usuarioService.eliminarUsuario(id, correoAdmin);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponse> actualizarRol(
            @PathVariable String id,
            @RequestParam Integer rolId,
            Authentication authentication) {
        String correoAdmin = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(usuarioService.actualizarRol(id, rolId, correoAdmin));
    }

    @PatchMapping ("/{id}/estado")
    @PreAuthorize ("hasAuthority ('ROLE_ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponse> alternarEstado(@PathVariable String id){
        return ResponseEntity.ok(usuarioService.alternarEstado(id));
    }
}
