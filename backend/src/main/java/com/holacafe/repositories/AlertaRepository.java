package com.holacafe.repositories;

import com.holacafe.model.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Integer> {
    List<Alerta> findByEstadoTrue();

    List<Alerta> findByMesaId(String mesaId);
}