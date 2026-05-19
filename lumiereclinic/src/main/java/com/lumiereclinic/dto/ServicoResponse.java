package com.lumiereclinic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ServicoResponse {
    private Long id;
    private String nome;
    private String categoria;
    private String descricao;
    private String profissionalPrincipal;
    private Double preco;
    private Integer duracaoMinutos;
    private Boolean ativo;
    private Boolean publicado;
    private String status;
}
