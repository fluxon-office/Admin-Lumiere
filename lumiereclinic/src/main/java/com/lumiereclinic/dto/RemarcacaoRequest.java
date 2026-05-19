package com.lumiereclinic.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RemarcacaoRequest {

    @NotNull
    @Future
    private LocalDateTime dataHora;

    private String observacao;
}
