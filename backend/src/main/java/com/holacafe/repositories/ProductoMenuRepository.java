package com.holacafe.repositories;

import com.holacafe.model.ProductoMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoMenuRepository extends JpaRepository<ProductoMenu, String> {
    List<ProductoMenu> buscarPorEstado(String estado);

    List<ProductoMenu> buscarPorCategoriaId(Integer categoriaId);

    List<ProductoMenu> buscarPorNombreContainingIgnoreCase(String nombre);
}