package com.lumiereclinic.service;

import com.lumiereclinic.dto.ServicoRequest;
import com.lumiereclinic.dto.ServicoResponse;
import com.lumiereclinic.exception.ResourceBadRequestException;
import com.lumiereclinic.exception.ResourceNotFoundException;
import com.lumiereclinic.model.Servico;
import com.lumiereclinic.repository.AgendamentoRepository;
import com.lumiereclinic.repository.ServicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final AgendamentoRepository agendamentoRepository;

    public ServicoService(ServicoRepository servicoRepository, AgendamentoRepository agendamentoRepository) {
        this.servicoRepository = servicoRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    public ServicoResponse criarServico(ServicoRequest request, String empresaId) {
        Servico servico = new Servico();
        aplicarDados(servico, request, empresaId);
        return paraResponse(servicoRepository.save(servico));
    }

    public List<ServicoResponse> listarServicosPublicos() {
        return servicoRepository.findServicosPublicos().stream()
                .map(this::paraResponse)
                .toList();
    }

    public List<ServicoResponse> listarTodosServicos(String empresaId, String nome, String categoria, String status, String profissional) {
        Boolean ativo = parseStatus(status);
        String nomeFiltro = normalizar(nome);
        String categoriaFiltro = normalizar(categoria);
        String profissionalFiltro = normalizar(profissional);

        return servicoRepository.buscarServicosAdmin(empresaId, nomeFiltro, categoriaFiltro, profissionalFiltro, ativo)
                .stream()
                .map(this::paraResponse)
                .toList();
    }

    public ServicoResponse detalharServico(Long id, String empresaId) {
        return paraResponse(buscarServicoDaEmpresa(id, empresaId));
    }

    public ServicoResponse atualizarServico(Long id, ServicoRequest request, String empresaId) {
        Servico servico = buscarServicoDaEmpresa(id, empresaId);
        aplicarDados(servico, request, empresaId);
        return paraResponse(servicoRepository.save(servico));
    }

    public ServicoResponse atualizarStatus(Long id, boolean ativo, String empresaId) {
        Servico servico = buscarServicoDaEmpresa(id, empresaId);
        servico.setAtivo(ativo);
        return paraResponse(servicoRepository.save(servico));
    }

    public void excluirServico(Long id, String empresaId) {
        Servico servico = buscarServicoDaEmpresa(id, empresaId);

        if (agendamentoRepository.existsByServicoId(servico.getId())) {
            throw new ResourceBadRequestException("Nao e possivel excluir um servico vinculado a agendamentos");
        }

        servicoRepository.delete(servico);
    }

    private Servico buscarServicoDaEmpresa(Long id, String empresaId) {
        return servicoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResourceNotFoundException("Servico nao encontrado"));
    }

    private void aplicarDados(Servico servico, ServicoRequest request, String empresaId) {
        if (request.getPreco() == null || request.getPreco() <= 0) {
            throw new ResourceBadRequestException("Preco do servico deve ser maior que zero");
        }

        if (request.getDuracaoMinutos() == null || request.getDuracaoMinutos() <= 0) {
            throw new ResourceBadRequestException("Duracao do servico deve ser maior que zero");
        }

        servico.setNome(request.getNome().trim());
        servico.setCategoria(request.getCategoria().trim());
        servico.setDescricao(request.getDescricao().trim());
        servico.setProfissionalPrincipal(request.getProfissionalPrincipal().trim());
        servico.setPreco(request.getPreco());
        servico.setDuracaoMinutos(request.getDuracaoMinutos());
        servico.setAtivo(request.getAtivo() != null ? request.getAtivo() : Boolean.TRUE);
        servico.setPublicado(request.getPublicado() != null ? request.getPublicado() : Boolean.TRUE);
        servico.setEmpresaId(empresaId);
    }

    private String normalizar(String valor) {
        if (valor == null) {
            return null;
        }

        String texto = valor.trim();
        return texto.isEmpty() ? null : texto;
    }

    private Boolean parseStatus(String status) {
        if (status == null || status.isBlank() || "todos".equalsIgnoreCase(status)) {
            return null;
        }

        return switch (status.trim().toLowerCase(Locale.ROOT)) {
            case "ativo" -> true;
            case "inativo" -> false;
            default -> throw new ResourceBadRequestException("Status de servico invalido");
        };
    }

    private ServicoResponse paraResponse(Servico servico) {
        return new ServicoResponse(
                servico.getId(),
                servico.getNome(),
                servico.getCategoria(),
                servico.getDescricao(),
                servico.getProfissionalPrincipal(),
                servico.getPreco(),
                servico.getDuracaoMinutos(),
                servico.getAtivo(),
                servico.getPublicado(),
                Boolean.TRUE.equals(servico.getAtivo()) ? "ativo" : "inativo"
        );
    }
}
