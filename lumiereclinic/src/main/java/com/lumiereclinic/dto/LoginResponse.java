package com.lumiereclinic.dto;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String mensagem;
    private String nome;
    private String email;
}