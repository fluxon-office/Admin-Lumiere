package com.lumiereclinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lumiereclinic.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findAllByEmail(String email);

    Optional<Usuario> findByEmailAndEmpresaId(String email, String empresaId);

}
