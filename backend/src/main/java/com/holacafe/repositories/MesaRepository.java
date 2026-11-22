package com.holacafe.repositories;

import com.holacafe.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, String> {
    Optional<Mesa> buscarPorNumero(Integer numero);

    List<Mesa> buscarPorEstado(String estado);

    List<Mesa> buscarPorMeseroId(String meseroId);
}