package com.holacafe.service;

import com.holacafe.dto.LoginRequest;
import com.holacafe.dto.RegistroUsuarioRequest;
import com.holacafe.dto.RestablecerPasswordRequest;
import com.holacafe.dto.UsuarioResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.Rol;
import com.holacafe.model.TokenRecuperacion;
import com.holacafe.model.Usuario;
import com.holacafe.repositories.RolRepository;
import com.holacafe.repositories.TokenRecuperacionRepository;
import com.holacafe.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${mail.from:noreply@holacafe.com}")
    private String mailFrom;

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

    @Transactional
    public Map<String, Object> solicitarRecuperacion(String correo) {
        String correoLimpio = correo.trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByCorreo(correoLimpio)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe ninguna cuenta registrada con el correo: " + correoLimpio));

        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            throw new IllegalArgumentException("La cuenta asociada a este correo no se encuentra activa.");
        }

        SecureRandom random = new SecureRandom();
        String codigo = String.format("%06d", random.nextInt(1_000_000));

        TokenRecuperacion token = new TokenRecuperacion();
        token.setUsuario(usuario);
        token.setToken(codigo);
        token.setFechaExpiracion(LocalDateTime.now().plusMinutes(15));
        token.setUsado(false);
        tokenRecuperacionRepository.save(token);

        boolean enviadoPorCorreo = false;
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(mailFrom);
            email.setTo(usuario.getCorreo());
            email.setSubject("¡Hola, Café! - Código de recuperación de contraseña");
            email.setText(
                    "Hola " + usuario.getNombre() + ",\n\n" +
                    "Recibimos una solicitud para restablecer tu contraseña en ¡Hola, Café!.\n\n" +
                    "Tu código de verificación es: " + codigo + "\n" +
                    "Este código vence en 15 minutos.\n\n" +
                    "Si no solicitaste este cambio, puedes ignorar este mensaje."
            );
            mailSender.send(email);
            enviadoPorCorreo = true;
        } catch (Exception ex) {
            System.out.println("[RECUPERACIÓN DE CONTRASEÑA] SMTP no disponible (" + ex.getMessage() + ")");
            System.out.println("[RECUPERACIÓN DE CONTRASEÑA] Código para " + usuario.getCorreo() + ": " + codigo);
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("enviadoPorCorreo", enviadoPorCorreo);
        if (enviadoPorCorreo) {
            respuesta.put("mensaje", "Enviamos un código de 6 dígitos a " + usuario.getCorreo() + ". Revisa tu bandeja de entrada.");
        } else {
            respuesta.put("mensaje", "Código generado correctamente. Como el servidor SMTP local no está configurado aún, te mostramos el código para pruebas.");
            respuesta.put("codigoDesarrollo", codigo);
        }
        return respuesta;
    }

    @Transactional
    public Map<String, Object> restablecerPassword(RestablecerPasswordRequest request) {
        String correoLimpio = request.getCorreo().trim().toLowerCase();
        String codigoLimpio = request.getCodigo().trim();

        TokenRecuperacion token = tokenRecuperacionRepository.findByToken(codigoLimpio)
                .orElseThrow(() -> new IllegalArgumentException("El código de verificación no es válido."));

        if (!token.getUsuario().getCorreo().equalsIgnoreCase(correoLimpio)) {
            throw new IllegalArgumentException("El código no corresponde al correo ingresado.");
        }
        if (Boolean.TRUE.equals(token.getUsado())) {
            throw new IllegalArgumentException("Este código ya fue utilizado. Solicita uno nuevo.");
        }
        if (token.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código ha expirado. Solicita uno nuevo.");
        }

        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);

        token.setUsado(true);
        tokenRecuperacionRepository.save(token);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión.");
        return respuesta;
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
