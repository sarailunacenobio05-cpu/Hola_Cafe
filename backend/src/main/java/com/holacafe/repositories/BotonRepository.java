package com.holacafe.repositories;

import com.holacafe.model.Boton;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BotonRepository extends JpaRepository<Boton, String> {
    Optional<Boton> findByMesaId(String mesaId);

    List<Boton> findByEstado(String estado);

    List<Boton> findByBateriaLessThan(Integer bateria);
}