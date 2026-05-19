package com.lumiereclinic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClienteResponse {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String ultimoServico;
    private String ultimaVisita;
    private String proximaVisita;
    private Long totalAgendamentos;
}
