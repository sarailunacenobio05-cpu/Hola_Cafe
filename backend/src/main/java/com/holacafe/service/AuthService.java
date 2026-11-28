package com.holacafe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.holacafe.model.TokenRevocado;
import com.holacafe.repositories.TokenRevocadoRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final TokenRevocadoRepository tokenRevocadoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${mail.from:noreply@holacafe.com}")
    private String mailFrom;

    @Value("${google.oauth.client-id:}")
    private String googleClientId;

    private final ObjectMapper objectMapper = new ObjectMapper();

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

    private String generarSiguienteIdUsuario() {
        int max = usuarioRepository.findAll().stream()
                .map(Usuario::getId)
                .filter(id -> id != null && id.startsWith("u-"))
                .mapToInt(id -> {
                    try {
                        return Integer.parseInt(id.substring(2));
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .max()
                .orElse(5);
        return "u-" + (max + 1);
    }

    @Transactional
    public UsuarioResponse autenticarConGoogle(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadCredentialsException("Token de Google inválido");
        }

        JsonNode payload = verificarTokenGoogle(idToken.trim());
        String aud = payload.path("aud").asText("");
        if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.trim().equals(aud)) {
            throw new BadCredentialsException("El token de Google no corresponde a esta aplicación");
        }

        String emailVerified = payload.path("email_verified").asText("false");
        String correo = payload.path("email").asText("").trim().toLowerCase();
        if (correo.isBlank() || !"true".equalsIgnoreCase(emailVerified)) {
            throw new BadCredentialsException("Tu cuenta de Google no tiene un correo verificado");
        }

        String nombreGoogle = payload.path("name").asText("").trim();
        String fotoGoogle = payload.path("picture").asText("").trim();

        return usuarioRepository.findByCorreo(correo)
                .map(usuario -> {
                    if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
                        throw new BadCredentialsException("El usuario no se encuentra activo");
                    }
                    usuario.setUltimoAcceso(LocalDateTime.now());
                    if ((usuario.getAvatarUrl() == null || usuario.getAvatarUrl().isBlank()) && !fotoGoogle.isBlank()) {
                        usuario.setAvatarUrl(fotoGoogle);
                    }
                    usuarioRepository.save(usuario);
                    return mapearUsuario(usuario);
                })
                .orElseGet(() -> {
                    Rol rolMesero = rolRepository.findById(2)
                            .orElseGet(() -> rolRepository.findAll().stream()
                                    .filter(r -> r.getNombre() != null && r.getNombre().toUpperCase().contains("MESERO"))
                                    .findFirst()
                                    .orElseThrow(() -> new ResourceNotFoundException("Rol Mesero no encontrado")));

                    Usuario nuevo = new Usuario();
                    nuevo.setId(generarSiguienteIdUsuario());
                    nuevo.setNombre(nombreGoogle.isBlank() ? correo.split("@")[0] : nombreGoogle);
                    nuevo.setCorreo(correo);
                    nuevo.setPasswordHash(passwordEncoder.encode("GOOGLE-" + UUID.randomUUID()));
                    nuevo.setRol(rolMesero);
                    nuevo.setEstado("ACTIVO");
                    nuevo.setMetodoAcceso("GOOGLE");
                    nuevo.setFechaRegistro(LocalDateTime.now());
                    if (!fotoGoogle.isBlank()) {
                        nuevo.setAvatarUrl(fotoGoogle);
                    }
                    nuevo.setUltimoAcceso(LocalDateTime.now());

                    Usuario guardado = usuarioRepository.save(nuevo);
                    return mapearUsuario(guardado);
                });
    }

    private JsonNode verificarTokenGoogle(String idToken) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token="
                    + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();
            HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                throw new BadCredentialsException("No se pudo verificar tu sesión con Google");
            }
            return objectMapper.readTree(resp.body());
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadCredentialsException("Error al validar la cuenta de Google: " + ex.getMessage());
        }
    }

    @Transactional
    public UsuarioResponse registrarUsuario(RegistroUsuarioRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese correo");
        }

        Rol rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + request.getRolId()));

        Usuario nuevo = new Usuario();
        nuevo.setId(generarSiguienteIdUsuario());
        nuevo.setNombre(request.getNombre());
        nuevo.setCorreo(request.getCorreo());
        nuevo.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        nuevo.setRol(rol);
        nuevo.setEstado("ACTIVO");
        nuevo.setMetodoAcceso("CORREO");
        nuevo.setFechaRegistro(LocalDateTime.now());
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(usuario.getCorreo());
            helper.setSubject("¡Hola, Café! - Código de recuperación de contraseña");

            String nombreSeguro = escaparHtml(usuario.getNombre());
            String html = """
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                      <meta charset="UTF-8" />
                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    </head>
                    <body style="margin:0;padding:24px 12px;background-color:#F5EFEB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E110A;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:440px;background-color:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E7DDD3;box-shadow:0 8px 24px rgba(30,17,10,0.08);">
                              <!-- Encabezado de marca -->
                              <tr>
                                <td align="center" style="background-color:#7B3F00;padding:26px 24px 22px;">
                                  <div style="font-size:26px;font-weight:900;letter-spacing:1px;color:#FFFFFF;line-height:1.15;">¡HOLA, CAFÉ!</div>
                                  <div style="margin-top:6px;font-size:11px;font-weight:700;letter-spacing:1.6px;color:#FCD34D;text-transform:uppercase;">CAFÉ CENTRAL · SEGURIDAD</div>
                                </td>
                              </tr>

                              <!-- Cuerpo principal -->
                              <tr>
                                <td style="padding:26px 28px 22px;background-color:#FFFFFF;">
                                  <div style="text-align:center;margin-bottom:14px;">
                                    <img src="cid:manitaCorreos" alt="¡Hola, Café!" width="120" height="120" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;border-radius:14px;" />
                                  </div>

                                  <h1 style="margin:0 0 18px;font-size:21px;font-weight:800;text-align:center;color:#1E110A;">Recupera tu contraseña</h1>

                                  <p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:#4B3E36;">
                                    Hola, <strong style="color:#1E110A;">__NOMBRE__</strong>:
                                  </p>
                                  <p style="margin:0 0 22px;font-size:14.5px;line-height:1.5;color:#4B3E36;">
                                    Usa este código para recuperar tu cuenta.
                                  </p>

                                  <!-- Caja del código -->
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF4E5;border:1px solid #F6D3A6;border-radius:14px;">
                                    <tr>
                                      <td align="center" style="padding:22px 16px;">
                                        <div style="font-size:34px;font-weight:900;letter-spacing:8px;color:#7B3F00;font-family:'Courier New',Courier,monospace;line-height:1.1;">__CODIGO__</div>
                                        <div style="margin-top:10px;font-size:12.5px;font-weight:600;color:#B45309;">Válido por 15 minutos</div>
                                      </td>
                                    </tr>
                                  </table>

                                  <p style="margin:22px 0 0;font-size:12.5px;line-height:1.55;text-align:center;color:#786B63;">
                                    Si no solicitaste este código, ignora el correo. No lo compartas.
                                  </p>
                                </td>
                              </tr>

                              <!-- Pie de página -->
                              <tr>
                                <td align="center" style="background-color:#FAF8F5;border-top:1px solid #F0E7DE;padding:15px 24px;">
                                  <span style="font-size:11.5px;color:#8C7D73;">¡Hola, Café! · Seguridad de tu cuenta</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                    """
                    .replace("__NOMBRE__", nombreSeguro)
                    .replace("__CODIGO__", codigo);

            helper.setText(html, true);
            ClassPathResource imagenRecurso = new ClassPathResource("static/ManitaCorreos.jpg");
            if (imagenRecurso.exists()) {
                helper.addInline("manitaCorreos", imagenRecurso, "image/jpeg");
            }
            mailSender.send(mimeMessage);
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
    @Transactional 
    public void revocarToken(String authHeader){
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            String jwt = authHeader.substring(7).trim();
            if(!jwt.isEmpty() && !tokenRevocadoRepository.existsByToken(jwt)){
                TokenRevocado revocado = new TokenRevocado();
                revocado.setToken(jwt);
                revocado.setFechaRevocacion(LocalDateTime.now());
                tokenRevocadoRepository.save(revocado);
            }
        }

    }

    private String escaparHtml(String texto) {
        if (texto == null) return "";
        return texto
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private UsuarioResponse mapearUsuario(Usuario usuario) {
        String metodo = (usuario.getMetodoAcceso() != null && !usuario.getMetodoAcceso().isBlank())
                ? usuario.getMetodoAcceso()
                : "CORREO";
        String fechaReg = (usuario.getFechaRegistro() != null)
                ? usuario.getFechaRegistro().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "—";
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                usuario.getEstado(),
                usuario.getAvatarUrl(),
                metodo,
                fechaReg
        );
    }
}
