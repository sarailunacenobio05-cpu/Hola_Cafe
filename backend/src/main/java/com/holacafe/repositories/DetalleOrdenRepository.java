package com.holacafe.repositories;

import com.holacafe.model.DetalleOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Integer> {
    List<DetalleOrden> findByOrdenId(String ordenId);

    List<DetalleOrden> findByCompletadoFalse();
}