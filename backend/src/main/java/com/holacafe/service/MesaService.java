package com.holacafe.service;

import com.holacafe.dto.AlertaResponse;
import com.holacafe.dto.BotonResponse;
import com.holacafe.dto.GuardarBotonRequest;
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
        return mapearAlerta(alertaRepository.save(alerta));
    }

    @Transactional
    public AlertaResponse registrarLlamada(String mesaId) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + mesaId));
        Boton boton = botonRepository.findByMesaId(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("No hay botón IoT asignado a la mesa: " + mesaId));

        Alerta alerta = new Alerta();
        alerta.setBoton(boton);
        alerta.setMesa(mesa);
        alerta.setEstado(true);
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
                alerta.getEstado()
        );
    }
}
