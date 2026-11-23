package com.holacafe.repositories;

import com.holacafe.model.OrdenComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenComandaRepository extends JpaRepository<OrdenComanda, String> {
    Optional<OrdenComanda> findByFolio(Integer folio);

    List<OrdenComanda> findByMesaId(String mesaId);

    List<OrdenComanda> findByMesaIdOrderByFechaDesc(String mesaId);

    List<OrdenComanda> findByEstado(String estado);

    List<OrdenComanda> findByMeseroId(String meseroId);

    Optional<OrdenComanda> findByMesaIdAndEstadoNot(String mesaId, String estado);

    List<OrdenComanda> findByFechaBetweenOrderByFechaDesc(LocalDateTime inicio, LocalDateTime fin);
}