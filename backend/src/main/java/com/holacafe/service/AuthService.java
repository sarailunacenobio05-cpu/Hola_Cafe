package com.holacafe.service;

import com.holacafe.dto.LoginRequest;
import com.holacafe.dto.RegistroUsuarioRequest;
import com.holacafe.dto.UsuarioResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.Rol;
import com.holacafe.model.Usuario;
import com.holacafe.repositories.RolRepository;
import com.holacafe.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse autenticar(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new BadCredentialsException("Correo o contraseña incorrectos"));

        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            throw new BadCredentialsException("El usuario no se encuentra activo");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return mapearUsuario(usuario);
    }

    @Transactional
    public UsuarioResponse registrarUsuario(RegistroUsuarioRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese correo");
        }

        Rol rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + request.getRolId()));

        Usuario nuevo = new Usuario();
        nuevo.setId(UUID.randomUUID().toString());
        nuevo.setNombre(request.getNombre());
        nuevo.setCorreo(request.getCorreo());
        nuevo.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        nuevo.setRol(rol);
        nuevo.setEstado("ACTIVO");
        nuevo.setUltimoAcceso(LocalDateTime.now());

        Usuario guardado = usuarioRepository.save(nuevo);
        return mapearUsuario(guardado);
    }

    private UsuarioResponse mapearUsuario(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                usuario.getEstado(),
                usuario.getAvatarUrl()
        );
    }
}
