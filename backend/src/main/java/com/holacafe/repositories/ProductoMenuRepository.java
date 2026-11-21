package com.holacafe.repositories;

import com.holacafe.model.ProductoMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoMenuRepository extends JpaRepository<ProductoMenu, String> {
    List<ProductoMenu> findByEstado(String estado);

    List<ProductoMenu> findByCategoriaId(Integer categoriaId);

    List<ProductoMenu> findByNombreContainingIgnoreCase(String nombre);
}