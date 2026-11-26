package com.holacafe.controller;

import com.holacafe.dto.AuthResponse;
import com.holacafe.dto.LoginRequest;
import com.holacafe.dto.RecuperarPasswordRequest;
import com.holacafe.dto.RegistroUsuarioRequest;
import com.holacafe.dto.RestablecerPasswordRequest;
import com.holacafe.dto.UsuarioResponse;
import com.holacafe.security.JwtService;
import com.holacafe.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


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

    @PostMapping("/recuperar-password")
    public ResponseEntity<Map<String, Object>> solicitarRecuperacion(
            @Valid @RequestBody RecuperarPasswordRequest request) {
        return ResponseEntity.ok(authService.solicitarRecuperacion(request.getCorreo()));
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<Map<String, Object>> restablecerPassword(
            @Valid @RequestBody RestablecerPasswordRequest request) {
        return ResponseEntity.ok(authService.restablecerPassword(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        @RequestHeader (value = "Authorization", required = false) String authHeader){
            authService.revocarToken(authHeader);
            return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada y token invalidado correctamente"));

        }
    
    
}
