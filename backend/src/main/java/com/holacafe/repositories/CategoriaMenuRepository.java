package com.holacafe.repositories;

import com.holacafe.model.CategoriaMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoriaMenuRepository extends JpaRepository<CategoriaMenu, Integer> {
    Optional<CategoriaMenu> findByNombre(String nombre);

    Optional<CategoriaMenu> findByNombreIgnoreCase(String nombre);
}