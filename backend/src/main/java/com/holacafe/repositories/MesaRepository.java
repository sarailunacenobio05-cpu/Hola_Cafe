package com.holacafe.repositories;

import com.holacafe.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, String> {
    Optional<Mesa> findByNumero(Integer numero);

    List<Mesa> findByEstado(String estado);

    List<Mesa> findByMeseroId(String meseroId);
}