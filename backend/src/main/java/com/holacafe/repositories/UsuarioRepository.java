package com.holacafe.repositories;

import com.holacafe.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> buscarPorCorreo(String correo);

    boolean existeCorreo(String correo);

    List<Usuario> buscarPorEstado(String estado);

    List<Usuario> buscarPorRolNombre(String nombreRol);
}