package com.holacafe.repositories;

import com.holacafe.model.TicketCocina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketCocinaRepository extends JpaRepository<TicketCocina, String> {
    Optional<TicketCocina> buscarPorOrdenId(String ordenId);

    List<TicketCocina> buscarPorEstado(String estado);
}