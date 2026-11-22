package com.holacafe.repositories;

import com.holacafe.model.OrdenComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenComandaRepository extends JpaRepository<OrdenComanda, String> {
    Optional<OrdenComanda> buscarPorFolio(Integer folio);

    List<OrdenComanda> buscarPorMesaId(String mesaId);

    List<OrdenComanda> buscarPorEstado(String estado);

    List<OrdenComanda> buscarPorMeseroId(String meseroId);

    Optional<OrdenComanda> buscarPorMesaIdYEstadoNo(String mesaId, String estado);
}