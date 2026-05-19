package com.lumiereclinic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DisponibilidadeResponse {
    private Long servicoId;
    private String data;
    private List<String> horariosOcupados;
}
