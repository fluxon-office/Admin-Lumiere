package com.lumiereclinic.controller;

import com.lumiereclinic.dto.AgendamentoRequest;
import com.lumiereclinic.dto.DisponibilidadeResponse;
import com.lumiereclinic.dto.RemarcacaoRequest;
import com.lumiereclinic.model.Agendamento;
import com.lumiereclinic.service.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService agendamentoService;

    @PostMapping("/publico")
    public Agendamento criarAgendamento(@Valid @RequestBody AgendamentoRequest request) {
        return agendamentoService.criarAgendamentoPublico(request);
    }

    @PostMapping
    public Agendamento criarAgendamentoAdmin(@Valid @RequestBody AgendamentoRequest request) {
        return agendamentoService.criarAgendamentoAdmin(request);
    }

    @GetMapping("/disponibilidade")
    public DisponibilidadeResponse listarDisponibilidade(
            @RequestParam Long servicoId,
            @RequestParam String data
    ) {
        LocalDate dataConvertida = LocalDate.parse(data);
        return agendamentoService.listarHorariosOcupados(servicoId, dataConvertida);
    }

    @GetMapping
    public List<Agendamento> listarAgendamentos(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String data,
            @RequestParam(required = false) String busca
    ) {
        LocalDate dataConvertida = data != null && !data.isBlank() ? LocalDate.parse(data) : null;
        return agendamentoService.listarAgendamentos(status, dataConvertida, busca);
    }

    @PutMapping("/{id}/confirmar")
    public Agendamento confirmar(@PathVariable Long id) {
        return agendamentoService.confirmarAgendamento(id);
    }

    @PutMapping("/{id}/cancelar")
    public Agendamento cancelar(@PathVariable Long id) {
        return agendamentoService.cancelarAgendamento(id);
    }

    @PutMapping("/{id}/remarcar")
    public Agendamento remarcar(@PathVariable Long id, @Valid @RequestBody RemarcacaoRequest request) {
        return agendamentoService.remarcarAgendamento(id, request);
    }

    @GetMapping("/data")
    public List<Agendamento> listarPorData(@RequestParam String data) {
        LocalDate dataConvertida = LocalDate.parse(data);
        return agendamentoService.listarPorData(dataConvertida);
    }
}
