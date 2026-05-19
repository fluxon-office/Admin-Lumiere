package com.lumiereclinic.repository;

import com.lumiereclinic.enums.StatusAgendamento;
import com.lumiereclinic.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findAllByOrderByDataHoraAsc();

    List<Agendamento> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);

    List<Agendamento> findByServicoIdAndDataHoraBetween(Long servicoId, LocalDateTime inicio, LocalDateTime fim);

    List<Agendamento> findByClienteIdOrderByDataHoraDesc(Long clienteId);

    @Query("""
            select agendamento
            from Agendamento agendamento
            where (:status is null or agendamento.status = :status)
              and (:inicio is null or agendamento.dataHora >= :inicio)
              and (:fim is null or agendamento.dataHora <= :fim)
              and (
                    :termo is null
                    or lower(agendamento.cliente.nome) like lower(concat('%', :termo, '%'))
                    or lower(agendamento.cliente.email) like lower(concat('%', :termo, '%'))
                    or lower(agendamento.cliente.telefone) like lower(concat('%', :termo, '%'))
                    or lower(agendamento.servico.nome) like lower(concat('%', :termo, '%'))
              )
            order by agendamento.dataHora asc
            """)
    List<Agendamento> buscarComFiltros(
            @Param("status") StatusAgendamento status,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("termo") String termo
    );

    boolean existsByDataHoraAndServicoId(LocalDateTime dataHora, Long servicoId);
}
