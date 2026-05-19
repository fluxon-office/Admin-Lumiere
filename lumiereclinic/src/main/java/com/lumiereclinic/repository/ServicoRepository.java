package com.lumiereclinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.lumiereclinic.model.Servico;

import java.util.List;
import java.util.Optional;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findByAtivoTrue();

    Optional<Servico> findByNomeIgnoreCase(String nome);

    @Query("select servico from Servico servico where servico.ativo = true and (servico.publicado = true or servico.publicado is null)")
    List<Servico> findServicosPublicos();

}
