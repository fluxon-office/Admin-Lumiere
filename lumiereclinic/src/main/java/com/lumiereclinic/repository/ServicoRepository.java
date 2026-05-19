package com.lumiereclinic.repository;

import com.lumiereclinic.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findByAtivoTrue();

    Optional<Servico> findByNomeIgnoreCase(String nome);

    List<Servico> findAllByNomeIgnoreCase(String nome);

    Optional<Servico> findByIdAndEmpresaId(Long id, String empresaId);

    @Query("""
            select servico
            from Servico servico
            where servico.empresaId = :empresaId
              and (:nome is null or lower(servico.nome) like lower(concat('%', :nome, '%')))
              and (:categoria is null or lower(servico.categoria) = lower(:categoria))
              and (:profissional is null or lower(servico.profissionalPrincipal) like lower(concat('%', :profissional, '%')))
              and (:ativo is null or servico.ativo = :ativo)
            order by servico.nome asc
            """)
    List<Servico> buscarServicosAdmin(
            @Param("empresaId") String empresaId,
            @Param("nome") String nome,
            @Param("categoria") String categoria,
            @Param("profissional") String profissional,
            @Param("ativo") Boolean ativo
    );

    @Query("select servico from Servico servico where servico.ativo = true and (servico.publicado = true or servico.publicado is null)")
    List<Servico> findServicosPublicos();
}
