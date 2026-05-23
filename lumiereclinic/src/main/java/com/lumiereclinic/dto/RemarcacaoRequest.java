package com.lumiereclinic.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RemarcacaoRequest {

    @NotNull
    @Future
    private LocalDateTime dataHora;

    @Pattern(regexp = "^[0-9()\\-\\s+]{0,20}$", message = "telefone invalido")
    private String telefone;

    private String observacao;
}
