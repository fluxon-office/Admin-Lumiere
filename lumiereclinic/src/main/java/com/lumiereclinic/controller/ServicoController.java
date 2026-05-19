package com.lumiereclinic.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.lumiereclinic.model.Servico;
import com.lumiereclinic.service.ServicoService;

import java.util.List;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    @Autowired
    private ServicoService servicoService;

    @PostMapping
    public Servico criarServico(@RequestBody Servico servico) {
        return servicoService.criarServico(servico);
    }

    @GetMapping
    public List<Servico> listarServicos() {
        return servicoService.listarServicosPublicos();
    }

    @GetMapping("/admin")
    public List<Servico> listarTodosServicos() {
        return servicoService.listarTodosServicos();
    }

    @PutMapping("/{id}")
    public Servico atualizarServico(@PathVariable Long id, @RequestBody Servico servico) {
        return servicoService.atualizarServico(id, servico);
    }

    @DeleteMapping("/{id}")
    public void desativarServico(@PathVariable Long id) {
        servicoService.desativarServico(id);
    }
}
