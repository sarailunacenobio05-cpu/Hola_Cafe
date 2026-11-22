package com.holacafe.repositories;

import com.holacafe.model.TokenRevocado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRevocadoRepository extends JpaRepository<TokenRevocado, Integer> {
    boolean existsByToken(String token);
}