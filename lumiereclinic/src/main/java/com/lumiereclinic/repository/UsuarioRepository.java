package com.lumiereclinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lumiereclinic.model.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

}