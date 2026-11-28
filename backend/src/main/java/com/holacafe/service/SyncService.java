package com.holacafe.service;

import com.holacafe.model.EstadoOperativo;
import com.holacafe.repositories.EstadoOperativoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final EstadoOperativoRepository estadoOperativoRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerCambios(long sinceVersion) {
        Long maxVersion = estadoOperativoRepository.obtenerVersionMaxima();
        long max = (maxVersion != null) ? maxVersion : 0L;

        Map<String, String> cambios = new HashMap<>();
        if (max > sinceVersion) {
            List<EstadoOperativo> filas = (sinceVersion <= 0)
                    ? estadoOperativoRepository.findAll()
                    : estadoOperativoRepository.findByVersionGreaterThan(sinceVersion);
            for (EstadoOperativo fila : filas) {
                cambios.put(fila.getClave(), fila.getValor());
            }
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("maxVersion", max);
        respuesta.put("cambios", cambios);
        return respuesta;
    }

    @Transactional
    public synchronized Map<String, Object> guardarCambios(Map<String, String> cambios) {
        Long maxVersion = estadoOperativoRepository.obtenerVersionMaxima();
        long nuevaVersion = ((maxVersion != null) ? maxVersion : 0L) + 1L;

        if (cambios != null && !cambios.isEmpty()) {
            LocalDateTime ahora = LocalDateTime.now();
            for (Map.Entry<String, String> entry : cambios.entrySet()) {
                String clave = entry.getKey();
                String valor = entry.getValue();
                if (clave == null || clave.isBlank() || valor == null) continue;

                String claveLimpia = clave.trim();
                if (claveLimpia.length() > 64) continue;

                EstadoOperativo entidad = estadoOperativoRepository.findById(claveLimpia)
                        .orElseGet(() -> {
                            EstadoOperativo e = new EstadoOperativo();
                            e.setClave(claveLimpia);
                            return e;
                        });
                entidad.setValor(valor);
                entidad.setVersion(nuevaVersion);
                entidad.setActualizadoEn(ahora);
                estadoOperativoRepository.save(entidad);
            }
        } else {
            nuevaVersion = (maxVersion != null) ? maxVersion : 0L;
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("maxVersion", nuevaVersion);
        return respuesta;
    }
}
