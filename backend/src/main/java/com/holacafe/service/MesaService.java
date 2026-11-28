package com.holacafe.service;

import com.holacafe.dto.AlertaResponse;
import com.holacafe.dto.BotonResponse;
import com.holacafe.dto.GuardarBotonRequest;
import com.holacafe.dto.IoTEventoRequest;
import com.holacafe.dto.MesaResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.Alerta;
import com.holacafe.model.Boton;
import com.holacafe.model.Mesa;
import com.holacafe.model.OrdenComanda;
import com.holacafe.repositories.AlertaRepository;
import com.holacafe.repositories.BotonRepository;
import com.holacafe.repositories.MesaRepository;
import com.holacafe.repositories.OrdenComandaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {
    private final MesaRepository mesaRepository;
    private final BotonRepository botonRepository;
    private final AlertaRepository alertaRepository;
    private final OrdenComandaRepository ordenComandaRepository;

    @Transactional(readOnly = true)
    public List<MesaResponse> listarTodas() {
        return mesaRepository.findAll().stream()
                .map(this::mapearMesa)
                .toList();
    }

    @Transactional
    public MesaResponse cambiarEstado(String id, String nuevoEstado) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + id));
        mesa.setEstado(nuevoEstado.toUpperCase());
        return mapearMesa(mesaRepository.save(mesa));
    }

    @Transactional(readOnly = true)
    public List<BotonResponse> listarBotones() {
        return botonRepository.findAll().stream()
                .map(this::mapearBoton)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BotonResponse> listarBotonesFiltrados(String search, String estado) {
        return botonRepository.findAll().stream()
                .map(this::mapearBoton)
                .filter(b -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.trim().toLowerCase();
                    return b.getId().toLowerCase().contains(q)
                            || (b.getNombre() != null && b.getNombre().toLowerCase().contains(q))
                            || (b.getMesaId() != null && b.getMesaId().toLowerCase().contains(q));
                })
                .filter(b -> {
                    if (estado == null || estado.isBlank() || "Todos".equalsIgnoreCase(estado)) return true;
                    String estadoVisual = resolverEstadoVisualBoton(b);
                    return estadoVisual.equalsIgnoreCase(estado.trim())
                            || (b.getEstado() != null && b.getEstado().equalsIgnoreCase(estado.trim()));
                })
                .toList();
    }

    private String resolverEstadoVisualBoton(BotonResponse b) {
        if ("Sin conexión".equalsIgnoreCase(b.getEstado())) return "Sin conexión";
        int bat = b.getBateria() != null ? b.getBateria() : 100;
        if (bat <= 10) return "Batería crítica";
        if (bat <= 25) return "Batería baja";
        if ("ONLINE".equalsIgnoreCase(b.getEstado()) || "En línea".equalsIgnoreCase(b.getEstado())) {
            return "En línea";
        }
        return "Sin conexión";
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> listarBotonesPaginado(int page, int size, String search, String estado) {
        List<BotonResponse> filtrados = listarBotonesFiltrados(search, estado);
        int totalElements = filtrados.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) totalElements / size));
        int paginaSegura = Math.max(1, Math.min(page, totalPages));
        int inicio = (paginaSegura - 1) * size;
        int fin = Math.min(inicio + size, totalElements);
        List<BotonResponse> content = (inicio < totalElements)
                ? filtrados.subList(inicio, fin)
                : java.util.Collections.emptyList();
        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("content", content);
        res.put("totalElements", totalElements);
        res.put("totalPages", totalPages);
        res.put("number", paginaSegura);
        return res;
    }

    @Transactional
    public BotonResponse crearBoton(GuardarBotonRequest request) {
        String idLimpio = request.getId().trim().toUpperCase();
        if (botonRepository.existsById(idLimpio)) {
            throw new IllegalArgumentException("Ya existe un botón registrado con el ID: " + idLimpio);
        }

        Boton boton = new Boton();
        boton.setId(idLimpio);
        boton.setNombre(request.getNombre().trim());
        boton.setBateria(request.getBateria() != null ? request.getBateria() : 100);
        boton.setEstado(
                request.getEstado() != null && !request.getEstado().isBlank()
                        ? request.getEstado().trim()
                        : "En línea"
        );

        if (request.getMesaId() != null && !request.getMesaId().isBlank()) {
            Mesa mesa = mesaRepository.findById(request.getMesaId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + request.getMesaId()));
            boton.setMesa(mesa);
        }

        return mapearBoton(botonRepository.save(boton));
    }

    @Transactional
    public BotonResponse actualizarBoton(String id, GuardarBotonRequest request) {
        Boton boton = botonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Botón no encontrado con ID: " + id));

        boton.setNombre(request.getNombre().trim());

        if (request.getMesaId() != null && !request.getMesaId().isBlank()) {
            Mesa mesa = mesaRepository.findById(request.getMesaId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + request.getMesaId()));
            boton.setMesa(mesa);
        } else {
            boton.setMesa(null);
        }

        if (request.getBateria() != null) {
            boton.setBateria(request.getBateria());
        }
        if (request.getEstado() != null && !request.getEstado().isBlank()) {
            boton.setEstado(request.getEstado().trim());
        }

        return mapearBoton(botonRepository.save(boton));
    }

    @Transactional
    public void eliminarBoton(String id) {
        Boton boton = botonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Botón no encontrado con ID: " + id));
        botonRepository.delete(boton);
    }

    @Transactional(readOnly = true)
    public List<AlertaResponse> listarAlertasActivas() {
        return alertaRepository.findByEstadoTrue().stream()
                .map(this::mapearAlerta)
                .toList();
    }

    @Transactional
    public AlertaResponse atenderAlerta(Integer alertaId) {
        Alerta alerta = alertaRepository.findById(alertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada con ID: " + alertaId));
        alerta.setEstado(false);
        AlertaResponse respuesta = mapearAlerta(alerta);
        if (alerta.getMesa() != null) {
            List<Alerta> activasMesa = alertaRepository.findByMesaIdAndEstadoTrue(alerta.getMesa().getId());
            if (!activasMesa.isEmpty()) {
                alertaRepository.deleteAll(activasMesa);
            }
        }
        if (alertaRepository.existsById(alertaId)) {
            alertaRepository.deleteById(alertaId);
        }
        return respuesta;
    }

    @Transactional
    public AlertaResponse registrarLlamada(String mesaId) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + mesaId));
        Boton boton = botonRepository.findByMesaId(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("No hay botón IoT asignado a la mesa: " + mesaId));

        List<Alerta> activas = alertaRepository.findByMesaIdAndEstadoTrue(mesa.getId());
        LocalDateTime ahoraMx = LocalDateTime.now(ZoneId.of("America/Mexico_City"));
        if (!activas.isEmpty()) {
            Alerta existente = activas.get(0);
            existente.setFecha(ahoraMx);
            return mapearAlerta(alertaRepository.save(existente));
        }

        Alerta alerta = new Alerta();
        alerta.setBoton(boton);
        alerta.setMesa(mesa);
        alerta.setEstado(true);
        alerta.setFecha(ahoraMx);
        return mapearAlerta(alertaRepository.save(alerta));
    }

    @Transactional
    public AlertaResponse registrarEventoIoT(IoTEventoRequest request) {
        if (request == null || (request.getMesa() == null && request.getBotonId() == null)) {
            throw new IllegalArgumentException("Se requiere el número o ID de mesa (o botonId).");
        }

        Mesa mesa = null;
        if (request.getMesa() != null && !request.getMesa().isBlank()) {
            String rawMesa = request.getMesa().trim();
            if (rawMesa.matches("\\d+")) {
                mesa = mesaRepository.findByNumero(Integer.parseInt(rawMesa))
                        .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con número: " + rawMesa));
            } else {
                mesa = mesaRepository.findById(rawMesa).orElse(null);
                if (mesa == null && rawMesa.toUpperCase().startsWith("M") && rawMesa.substring(1).matches("\\d+")) {
                    mesa = mesaRepository.findByNumero(Integer.parseInt(rawMesa.substring(1))).orElse(null);
                }
                if (mesa == null) {
                    throw new ResourceNotFoundException("Mesa no encontrada: " + rawMesa);
                }
            }
        }

        Boton boton = null;
        if (request.getBotonId() != null && !request.getBotonId().isBlank()) {
            boton = botonRepository.findById(request.getBotonId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Botón no encontrado con ID: " + request.getBotonId()));
            if (mesa == null) {
                mesa = boton.getMesa();
            }
        } else if (mesa != null) {
            final String mesaIdFinal = mesa.getId();
            final Integer numMesa = mesa.getNumero();
            boton = botonRepository.findByMesaId(mesaIdFinal).orElse(null);
            if (boton == null) {
                String autoId = String.format("BOT-M%02d", numMesa);
                boton = botonRepository.findById(autoId).orElseGet(Boton::new);
                boton.setId(autoId);
                if (boton.getNombre() == null || boton.getNombre().isBlank()) {
                    boton.setNombre(String.format("Botón de Mesa %02d", numMesa));
                }
                boton.setMesa(mesa);
            }
        }

        if (mesa == null || boton == null) {
            throw new ResourceNotFoundException("No se pudo asociar mesa y botón IoT para la alerta.");
        }

        if (request.getBateria() != null) {
            int bateriaSegura = Math.max(0, Math.min(100, request.getBateria()));
            boton.setBateria(bateriaSegura);
        }
        boton.setEstado("En línea");
        botonRepository.save(boton);

        // Agrupar alertas: si la mesa ya tiene una alerta activa pendiente, no duplicar
        List<Alerta> activas = alertaRepository.findByMesaIdAndEstadoTrue(mesa.getId());
        LocalDateTime ahoraMx = LocalDateTime.now(ZoneId.of("America/Mexico_City"));
        if (!activas.isEmpty()) {
            Alerta existente = activas.get(0);
            existente.setFecha(ahoraMx);
            return mapearAlerta(alertaRepository.save(existente));
        }

        Alerta alerta = new Alerta();
        alerta.setBoton(boton);
        alerta.setMesa(mesa);
        alerta.setEstado(true);
        alerta.setFecha(ahoraMx);
        return mapearAlerta(alertaRepository.save(alerta));
    }

    private MesaResponse mapearMesa(Mesa mesa) {
        String meseroNombre = (mesa.getMesero() != null) ? mesa.getMesero().getNombre() : null;
        String meseroId = (mesa.getMesero() != null) ? mesa.getMesero().getId() : null;
        String comandaId = null;
        BigDecimal comandaTotal = BigDecimal.ZERO;

        if (!"LIBRE".equalsIgnoreCase(mesa.getEstado()) && !"Limpia / Disponible".equalsIgnoreCase(mesa.getEstado())) {
            List<OrdenComanda> comandas = ordenComandaRepository.findByMesaIdOrderByFechaDesc(mesa.getId());
            if (!comandas.isEmpty()) {
                OrdenComanda activa = comandas.get(0);
                if (!"PAGADA".equalsIgnoreCase(activa.getEstado()) && !"CANCELADA".equalsIgnoreCase(activa.getEstado())) {
                    comandaId = activa.getId();
                    comandaTotal = activa.getTotal();
                }
            }
        }

        return new MesaResponse(
                mesa.getId(),
                mesa.getNumero(),
                mesa.getCapacidad(),
                mesa.getEstado(),
                meseroId,
                meseroNombre,
                comandaId,
                comandaTotal
        );
    }

    private BotonResponse mapearBoton(Boton boton) {
        String mesaId = (boton.getMesa() != null) ? boton.getMesa().getId() : null;
        Integer mesaNumero = (boton.getMesa() != null) ? boton.getMesa().getNumero() : null;
        return new BotonResponse(
                boton.getId(),
                boton.getNombre(),
                mesaId,
                mesaNumero,
                boton.getBateria(),
                boton.getEstado()
        );
    }

    private AlertaResponse mapearAlerta(Alerta alerta) {
        String dispositivoId = (alerta.getBoton() != null) ? alerta.getBoton().getId() : null;
        String mesaId = (alerta.getMesa() != null) ? alerta.getMesa().getId() : null;
        Integer mesaNumero = (alerta.getMesa() != null) ? alerta.getMesa().getNumero() : null;
        String usuarioId = (alerta.getUsuario() != null) ? alerta.getUsuario().getId() : null;
        return new AlertaResponse(
                alerta.getId(),
                dispositivoId,
                mesaId,
                mesaNumero,
                usuarioId,
                alerta.getEstado(),
                alerta.getFecha()
        );
    }
}
