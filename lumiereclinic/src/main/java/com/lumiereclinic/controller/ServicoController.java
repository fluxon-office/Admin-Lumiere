package com.lumiereclinic.controller;

import com.lumiereclinic.dto.ServicoRequest;
import com.lumiereclinic.dto.ServicoResponse;
import com.lumiereclinic.service.ServicoService;
import com.lumiereclinic.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    private final ServicoService servicoService;
    private final UsuarioService usuarioService;

    public ServicoController(ServicoService servicoService, UsuarioService usuarioService) {
        this.servicoService = servicoService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ServicoResponse criarServico(@Valid @RequestBody ServicoRequest servico, Principal principal) {
        return servicoService.criarServico(servico, empresaId(principal));
    }

    @GetMapping
    public List<ServicoResponse> listarServicos() {
        return servicoService.listarServicosPublicos();
    }

    @GetMapping("/admin")
    public List<ServicoResponse> listarTodosServicos(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String profissional,
            Principal principal
    ) {
        return servicoService.listarTodosServicos(empresaId(principal), nome, categoria, status, profissional);
    }

    @GetMapping("/{id}")
    public ServicoResponse detalharServico(@PathVariable Long id, Principal principal) {
        return servicoService.detalharServico(id, empresaId(principal));
    }

    @PutMapping("/{id}")
    public ServicoResponse atualizarServico(@PathVariable Long id, @Valid @RequestBody ServicoRequest servico, Principal principal) {
        return servicoService.atualizarServico(id, servico, empresaId(principal));
    }

    @PatchMapping("/{id}/status")
    public ServicoResponse atualizarStatus(@PathVariable Long id, @RequestParam boolean ativo, Principal principal) {
        return servicoService.atualizarStatus(id, ativo, empresaId(principal));
    }

    @DeleteMapping("/{id}")
    public void excluirServico(@PathVariable Long id, Principal principal) {
        servicoService.excluirServico(id, empresaId(principal));
    }

    private String empresaId(Principal principal) {
        return usuarioService.buscarPorEmail(principal.getName()).getEmpresaId();
    }
}
