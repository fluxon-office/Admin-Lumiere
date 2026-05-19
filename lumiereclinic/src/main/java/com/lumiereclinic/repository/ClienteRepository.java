package com.lumiereclinic.repository;

import com.lumiereclinic.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByEmail(String email);

    List<Cliente> findAllByOrderByNomeAsc();

    @Query("""
            select cliente
            from Cliente cliente
            where lower(cliente.nome) like lower(concat('%', :termo, '%'))
               or lower(cliente.email) like lower(concat('%', :termo, '%'))
               or lower(cliente.telefone) like lower(concat('%', :termo, '%'))
            order by cliente.nome asc
            """)
    List<Cliente> buscarPorTermo(@Param("termo") String termo);
}
