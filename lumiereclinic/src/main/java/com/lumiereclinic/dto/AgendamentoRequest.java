package com.lumiereclinic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AgendamentoRequest {

    @NotBlank
    private String nome;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Pattern(regexp = "^[0-9()\\-\\s+]{10,20}$", message = "telefone invalido")
    private String telefone;
    @NotNull
    private Long servicoId;
    @NotNull
    @Future
    private LocalDateTime dataHora;
    private String observacao;
}
