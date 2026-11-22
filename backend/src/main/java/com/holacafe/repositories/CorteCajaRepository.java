package com.holacafe.repositories;

import com.holacafe.model.CorteCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorteCajaRepository extends JpaRepository<CorteCaja, String> {
    List<CorteCaja> findByResponsableId(String responsableId);
}