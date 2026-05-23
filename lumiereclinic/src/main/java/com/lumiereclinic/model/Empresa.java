package com.lumiereclinic.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "empresas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {

    @Id
    @Column(length = 80)
    private String id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String telefone;

    @Column(nullable = false, length = 300)
    private String endereco;

    @Column(nullable = false)
    private String horarioSemanaInicio;

    @Column(nullable = false)
    private String horarioSemanaFim;

    @Column(nullable = false)
    private String horarioSabadoInicio;

    @Column(nullable = false)
    private String horarioSabadoFim;

    @Column(nullable = false)
    private String intervaloInicio;

    @Column(nullable = false)
    private String intervaloFim;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        criadoEm = LocalDateTime.now();
        if (ativo == null) {
            ativo = true;
        }
    }
}
