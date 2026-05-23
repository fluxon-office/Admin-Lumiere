package com.lumiereclinic.dto;

import lombok.Data;

@Data
public class BootstrapRequest {

    private String email;
    private String nome;
    private String senha;
    private String telefone;

    private String businessAddress;
    private String businessDocument;
    private String businessEmail;
    private String businessName;
    private String businessPhone;
    private String ownerEmail;
    private String ownerName;
    private String ownerPhone;
    private String password;
}
