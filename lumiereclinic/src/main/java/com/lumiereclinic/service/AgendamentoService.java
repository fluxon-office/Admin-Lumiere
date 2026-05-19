package com.lumiereclinic.service;

import com.lumiereclinic.dto.AgendamentoRequest;
import com.lumiereclinic.dto.DisponibilidadeResponse;
import com.lumiereclinic.dto.RemarcacaoRequest;
import com.lumiereclinic.enums.StatusAgendamento;
import com.lumiereclinic.exception.ResourceBadRequestException;
import com.lumiereclinic.exception.ResourceNotFoundException;
import com.lumiereclinic.model.Agendamento;
import com.lumiereclinic.model.Cliente;
import com.lumiereclinic.model.Servico;
import com.lumiereclinic.repository.AgendamentoRepository;
import com.lumiereclinic.repository.ClienteRepository;
import com.lumiereclinic.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class AgendamentoService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Transactional
    public Agendamento criarAgendamentoPublico(AgendamentoRequest request) {
        if (request.getDataHora().isBefore(LocalDateTime.now())) {
            throw new ResourceBadRequestException("Nao e possivel agendar no passado");
        }

        Servico servico = servicoRepository.findById(request.getServicoId())
                .orElseThrow(() -> new ResourceBadRequestException("Servico nao encontrado"));

        if (!Boolean.TRUE.equals(servico.getAtivo())) {
            throw new ResourceBadRequestException("Servico indisponivel para agendamento");
        }

        Cliente cliente = clienteRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    Cliente novo = new Cliente();
                    novo.setNome(request.getNome());
                    novo.setEmail(request.getEmail());
                    novo.setTelefone(request.getTelefone());
                    return clienteRepository.save(novo);
                });

        cliente.setNome(request.getNome());
        cliente.setTelefone(request.getTelefone());
        clienteRepository.save(cliente);

        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setServico(servico);
        agendamento.setDataHora(request.getDataHora());
        agendamento.setObservacao(request.getObservacao());

        try {
            return agendamentoRepository.save(agendamento);
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceBadRequestException("Horario ja ocupado para o servico selecionado");
        }
    }

    public List<Agendamento> listarAgendamentos(String status, LocalDate data, String busca) {
        StatusAgendamento statusFiltro = null;

        if (status != null && !status.isBlank()) {
            try {
                statusFiltro = StatusAgendamento.valueOf(status.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                throw new ResourceBadRequestException("Status de agendamento invalido");
            }
        }

        String termo = busca == null || busca.isBlank() ? null : busca.trim();
        LocalDateTime inicio = data != null ? data.atStartOfDay() : null;
        LocalDateTime fim = data != null ? data.atTime(23, 59, 59) : null;
        return agendamentoRepository.buscarComFiltros(statusFiltro, inicio, fim, termo);
    }

    @Transactional
    public Agendamento criarAgendamentoAdmin(AgendamentoRequest request) {
        return criarAgendamentoPublico(request);
    }

    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento nao encontrado"));

        agendamento.setStatus(StatusAgendamento.CONFIRMADO);
        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento remarcarAgendamento(Long id, RemarcacaoRequest request) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento nao encontrado"));

        if (request.getDataHora().isBefore(LocalDateTime.now())) {
            throw new ResourceBadRequestException("Nao e possivel remarcar para uma data passada");
        }

        if (agendamentoRepository.existsByDataHoraAndServicoId(request.getDataHora(), agendamento.getServico().getId())
                && !request.getDataHora().equals(agendamento.getDataHora())) {
            throw new ResourceBadRequestException("Horario ja ocupado para o servico selecionado");
        }

        agendamento.setDataHora(request.getDataHora());
        agendamento.setStatus(StatusAgendamento.REMARCAR);

        if (request.getObservacao() != null && !request.getObservacao().isBlank()) {
            agendamento.setObservacao(request.getObservacao().trim());
        }

        return agendamentoRepository.save(agendamento);
    }

    public Agendamento cancelarAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento nao encontrado"));

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        return agendamentoRepository.save(agendamento);
    }

    public List<Agendamento> listarPorData(LocalDate data) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(23, 59, 59);
        return agendamentoRepository.findByDataHoraBetween(inicio, fim);
    }

    public DisponibilidadeResponse listarHorariosOcupados(Long servicoId, LocalDate data) {
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Servico nao encontrado"));

        if (!Boolean.TRUE.equals(servico.getAtivo())) {
            throw new ResourceBadRequestException("Servico indisponivel para consulta");
        }

        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(23, 59, 59);

        List<String> horariosOcupados = agendamentoRepository
                .findByServicoIdAndDataHoraBetween(servicoId, inicio, fim)
                .stream()
                .filter(agendamento -> agendamento.getStatus() != StatusAgendamento.CANCELADO)
                .map(agendamento -> agendamento.getDataHora().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm", Locale.ROOT)))
                .toList();

        return new DisponibilidadeResponse(servicoId, data.toString(), horariosOcupados);
    }
}
