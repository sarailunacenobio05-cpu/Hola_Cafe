package com.holacafe.service;
import com.holacafe.dto.CorteCajaResponse;
import com.holacafe.dto.RegistrarCorteRequest;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.CorteCaja;
import com.holacafe.model.OrdenComanda;
import com.holacafe.model.Usuario;
import com.holacafe.repositories.CorteCajaRepository;
import com.holacafe.repositories.OrdenComandaRepository;
import com.holacafe.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
@Service
@RequiredArgsConstructor
public class CorteCajaService {
    private final CorteCajaRepository corteCajaRepository;
    private final OrdenComandaRepository ordenComandaRepository;
    private final UsuarioRepository usuarioRepository;
    @Transactional(readOnly = true)
    public List<CorteCajaResponse> listarTodos() {
        return corteCajaRepository.findAllByOrderByFechaDesc().stream()
                .map(this::mapearCorte)
                .toList();
    }
    @Transactional(readOnly = true)
    public List<CorteCajaResponse> listarPorFecha(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);
        return corteCajaRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin).stream()
                .map(this::mapearCorte)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> listarPaginado(int page, int size, LocalDate fecha) {
        List<CorteCajaResponse> filtrados = (fecha != null) ? listarPorFecha(fecha) : listarTodos();
        int totalElements = filtrados.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) totalElements / size));
        int paginaSegura = Math.max(1, Math.min(page, totalPages));
        int inicio = (paginaSegura - 1) * size;
        int fin = Math.min(inicio + size, totalElements);
        List<CorteCajaResponse> content = (inicio < totalElements)
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
    public CorteCajaResponse registrarCorte(RegistrarCorteRequest request, String correoResponsable) {
        Usuario responsable = usuarioRepository.findByCorreo(correoResponsable)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario responsable no encontrado con correo: " + correoResponsable));
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime inicioDia = ahora.toLocalDate().atStartOfDay();
        // Obtener órdenes cobradas del día para calcular tickets
        List<OrdenComanda> comandasDelDia = ordenComandaRepository.findByFechaBetweenOrderByFechaDesc(inicioDia, ahora);
        int totalTickets = (int) comandasDelDia.stream()
                .filter(c -> "PAGADA".equalsIgnoreCase(c.getEstado()))
                .count();
        BigDecimal totalVentas = request.getMontoEfectivo()
                .add(request.getMontoTarjeta())
                .add(request.getMontoTransferenciaQr());
        // Generar folio: CORTE-YYYYMMDD-HHMMSS
        String folio = "CORTE-" + ahora.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        CorteCaja corte = new CorteCaja();
        corte.setFolio(folio);
        corte.setResponsable(responsable);
        corte.setTotalVentas(totalVentas);
        corte.setMontoEfectivo(request.getMontoEfectivo());
        corte.setMontoTarjeta(request.getMontoTarjeta());
        corte.setMontoTransferenciaQr(request.getMontoTransferenciaQr());
        corte.setTotalTickets(totalTickets);
        corte.setObservaciones(request.getObservaciones());
        corte.setFecha(ahora);
        return mapearCorte(corteCajaRepository.save(corte));
    }
    private CorteCajaResponse mapearCorte(CorteCaja corte) {
        String responsableNombre = (corte.getResponsable() != null) ? corte.getResponsable().getNombre() : "N/A";
        String responsableId = (corte.getResponsable() != null) ? corte.getResponsable().getId() : null;
        return new CorteCajaResponse(
                corte.getFolio(),
                responsableId,
                responsableNombre,
                corte.getTotalVentas(),
                corte.getMontoEfectivo(),
                corte.getMontoTarjeta(),
                corte.getMontoTransferenciaQr(),
                corte.getTotalTickets(),
                corte.getObservaciones(),
                corte.getFecha()
        );
    }
}
