package com.holacafe.repositories;

import com.holacafe.model.OpcionProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpcionProductoRepository extends JpaRepository<OpcionProducto, Integer> {
    List<OpcionProducto> buscarByProductoId(String productoId);
}