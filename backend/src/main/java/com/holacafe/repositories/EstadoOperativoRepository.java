package com.holacafe.repositories;

import com.holacafe.model.EstadoOperativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstadoOperativoRepository extends JpaRepository<EstadoOperativo, String> {

    List<EstadoOperativo> findByVersionGreaterThan(Long version);

    @Query("SELECT COALESCE(MAX(e.version), 0) FROM EstadoOperativo e")
    Long obtenerVersionMaxima();
}
