package com.holacafe.repositories;

import com.holacafe.model.CategoriaMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaMenuRepository extends JpaRepository<CategoriaMenu, Integer> {
}