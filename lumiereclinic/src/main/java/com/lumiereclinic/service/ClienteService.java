package com.lumiereclinic.service;

import com.lumiereclinic.dto.ClienteResponse;
import com.lumiereclinic.model.Agendamento;
import com.lumiereclinic.model.Cliente;
import com.lumiereclinic.repository.AgendamentoRepository;
import com.lumiereclinic.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;

    public ClienteService(ClienteRepository clienteRepository, AgendamentoRepository agendamentoRepository) {
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    public List<ClienteResponse> listarClientes(String busca) {
        String termo = normalizarBusca(busca);
        List<Cliente> clientes = termo == null
                ? clienteRepository.findAllByOrderByNomeAsc()
                : clienteRepository.buscarPorTermo(termo);

        return clientes.stream()
                .map(this::paraResponse)
                .toList();
    }

    private ClienteResponse paraResponse(Cliente cliente) {
        List<Agendamento> agendamentos = agendamentoRepository.findByClienteIdOrderByDataHoraDesc(cliente.getId());
        Agendamento maisRecente = agendamentos.stream()
                .max(Comparator.comparing(Agendamento::getDataHora))
                .orElse(null);
        Agendamento proximo = agendamentos.stream()
                .filter(agendamento -> agendamento.getDataHora().isAfter(LocalDateTime.now()))
                .min(Comparator.comparing(Agendamento::getDataHora))
                .orElse(null);

        return new ClienteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getTelefone(),
                maisRecente != null ? maisRecente.getServico().getNome() : null,
                maisRecente != null ? maisRecente.getDataHora().toString() : null,
                proximo != null ? proximo.getDataHora().toString() : null,
                (long) agendamentos.size()
        );
    }

    private String normalizarBusca(String busca) {
        if (busca == null) {
            return null;
        }

        String termo = busca.trim();
        return termo.isEmpty() ? null : termo;
    }
}
