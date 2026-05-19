package com.lumiereclinic.service;

import com.lumiereclinic.exception.ResourceNotFoundException;
import com.lumiereclinic.model.Servico;
import com.lumiereclinic.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository servicoRepository;

    public Servico criarServico(Servico servico) {
        if (servico.getAtivo() == null) {
            servico.setAtivo(true);
        }

        if (servico.getPublicado() == null) {
            servico.setPublicado(true);
        }

        if (servico.getCategoria() == null || servico.getCategoria().isBlank()) {
            servico.setCategoria("Facial");
        }

        return servicoRepository.save(servico);
    }

    public List<Servico> listarServicosPublicos() {
        return servicoRepository.findServicosPublicos();
    }

    public List<Servico> listarTodosServicos() {
        return servicoRepository.findAll();
    }

    public Servico atualizarServico(Long id, Servico servicoAtualizado) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servico nao encontrado"));

        servico.setNome(servicoAtualizado.getNome());
        servico.setDescricao(servicoAtualizado.getDescricao());
        if (servicoAtualizado.getCategoria() != null && !servicoAtualizado.getCategoria().isBlank()) {
            servico.setCategoria(servicoAtualizado.getCategoria());
        }
        servico.setPreco(servicoAtualizado.getPreco());
        servico.setDuracaoMinutos(servicoAtualizado.getDuracaoMinutos());

        if (servicoAtualizado.getAtivo() != null) {
            servico.setAtivo(servicoAtualizado.getAtivo());
        }

        if (servicoAtualizado.getPublicado() != null) {
            servico.setPublicado(servicoAtualizado.getPublicado());
        }

        return servicoRepository.save(servico);
    }

    public void desativarServico(Long id) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servico nao encontrado"));

        servico.setAtivo(false);
        servicoRepository.save(servico);
    }
}
