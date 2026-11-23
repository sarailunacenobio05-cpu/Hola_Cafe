package com.holacafe.service;

import com.holacafe.dto.TicketRevisionResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.DetalleOrden;
import com.holacafe.model.OrdenComanda;
import com.holacafe.repositories.DetalleOrdenRepository;
import com.holacafe.repositories.OrdenComandaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComandaService {

    private final OrdenComandaRepository ordenComandaRepository;
    private final DetalleOrdenRepository detalleOrdenRepository;

    @Transactional(readOnly = true)
    public List<TicketRevisionResponse> listarTicketsPorFecha(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        return ordenComandaRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin)
                .stream()
                .map(this::mapearTicket)
                .toList();
    }

    @Transactional
    public TicketRevisionResponse alternarRevisado(String id) {
        OrdenComanda orden = ordenComandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con ID: " + id));

        orden.setRevisado(!Boolean.TRUE.equals(orden.getRevisado()));
        OrdenComanda guardada = ordenComandaRepository.save(orden);
        return mapearTicket(guardada);
    }

    @Transactional
    public void marcarPlatilloCompletado(Integer detalleId, boolean completado) {
        DetalleOrden detalle = detalleOrdenRepository.findById(detalleId)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle de orden no encontrado con ID: " + detalleId));

        detalle.setCompletado(completado);
        detalle.setFechaCompletado(completado ? LocalDateTime.now() : null);
        detalleOrdenRepository.save(detalle);
    }

    private TicketRevisionResponse mapearTicket(OrdenComanda orden) {
        List<TicketRevisionResponse.LineaDetalleResponse> lineas = orden.getDetalles()
                .stream()
                .map(d -> new TicketRevisionResponse.LineaDetalleResponse(
                        d.getId(),
                        d.getProducto().getNombre(),
                        d.getOpcion() != null ? d.getOpcion().getNombre() : null,
                        d.getCantidad(),
                        d.getPrecioUnitario(),
                        d.getSubtotal(),
                        d.getNotas(),
                        d.getCompletado()
                ))
                .toList();

        String mesa = orden.getMesa().getNumero() != null
                ? String.format("%02d", orden.getMesa().getNumero())
                : orden.getMesa().getId();

        return new TicketRevisionResponse(
                orden.getId(),
                orden.getFolio(),
                mesa,
                orden.getMesero().getNombre(),
                orden.getEstado(),
                orden.getMetodoPago(),
                orden.getSubtotal(),
                orden.getDescuentoPorcentaje(),
                orden.getPropina(),
                orden.getTotal(),
                orden.getRevisado(),
                orden.getFecha(),
                lineas
        );
    }
}
