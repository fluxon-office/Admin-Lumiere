package com.lumiereclinic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServicoRequest {

    @NotBlank
    private String nome;

    @NotBlank
    private String categoria;

    @NotBlank
    private String descricao;

    @NotBlank
    private String profissionalPrincipal;

    @NotNull
    @DecimalMin(value = "0.01")
    private Double preco;

    @NotNull
    @Min(1)
    private Integer duracaoMinutos;

    private Boolean ativo;

    private Boolean publicado;
}
