package com.holacafe.service;

import com.holacafe.dto.UsuarioResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.CorteCaja;
import com.holacafe.model.Mesa;
import com.holacafe.model.OrdenComanda;
import com.holacafe.model.Usuario;
import com.holacafe.repositories.CorteCajaRepository;
import com.holacafe.repositories.MesaRepository;
import com.holacafe.repositories.OrdenComandaRepository;
import com.holacafe.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final MesaRepository mesaRepository;
    private final OrdenComandaRepository ordenComandaRepository;
    private final CorteCajaRepository corteCajaRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::mapearUsuario)
                .toList();
    }

    @Transactional
    public void eliminarUsuario(String id, String correoAdminActual) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        if (correoAdminActual != null && usuario.getCorreo().equalsIgnoreCase(correoAdminActual)) {
            throw new IllegalArgumentException("No puedes eliminar tu propia cuenta mientras tienes la sesión activa.");
        }

        // Desasignar mesas que tenía asignadas
        List<Mesa> mesasAsignadas = mesaRepository.findByMeseroId(id);
        for (Mesa mesa : mesasAsignadas) {
            mesa.setMesero(null);
        }
        if (!mesasAsignadas.isEmpty()) {
            mesaRepository.saveAll(mesasAsignadas);
        }

        // Reasignar órdenes y cortes de caja al administrador actual para evitar error de llave foránea
        List<OrdenComanda> ordenes = ordenComandaRepository.findByMeseroId(id);
        List<CorteCaja> cortes = corteCajaRepository.findByResponsableId(id);

        if (!ordenes.isEmpty() || !cortes.isEmpty()) {
            Usuario reemplazo = (correoAdminActual != null)
                    ? usuarioRepository.findByCorreo(correoAdminActual)
                            .orElseThrow(() -> new ResourceNotFoundException("No se encontró el administrador actual para reasignar historial"))
                    : usuarioRepository.findAll().stream()
                            .filter(u -> !u.getId().equals(id))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("No es posible eliminar el único usuario con registros históricos."));

            for (OrdenComanda orden : ordenes) {
                orden.setMesero(reemplazo);
            }
            if (!ordenes.isEmpty()) {
                ordenComandaRepository.saveAll(ordenes);
            }

            for (CorteCaja corte : cortes) {
                corte.setResponsable(reemplazo);
            }
            if (!cortes.isEmpty()) {
                corteCajaRepository.saveAll(cortes);
            }
        }

        usuarioRepository.delete(usuario);
    }

    @Transactional 
    public UsuarioResponse alternarEstado(String id){
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        String nuevoEstado = "ACTIVO".equalsIgnoreCase(usuario.getEstado()) ? "BAJA" : "ACTIVO";
        usuario.setEstado(nuevoEstado);
        return mapearUsuario(usuarioRepository.save(usuario));
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
