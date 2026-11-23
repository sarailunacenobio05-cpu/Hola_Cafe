package com.holacafe.controller;

import com.holacafe.dto.AuthResponse;
import com.holacafe.dto.LoginRequest;
import com.holacafe.dto.RegistroUsuarioRequest;
import com.holacafe.dto.UsuarioResponse;
import com.holacafe.security.JwtService;
import com.holacafe.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        UsuarioResponse usuario = authService.autenticar(request);
        String token = jwtService.generarToken(usuario.getCorreo(), usuario.getRol());
        return ResponseEntity.ok(new AuthResponse(token, usuario));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroUsuarioRequest request) {
        UsuarioResponse nuevoUsuario = authService.registrarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }
}
