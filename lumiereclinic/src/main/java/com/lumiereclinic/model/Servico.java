package com.lumiereclinic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "servicos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String descricao;

    @Column
    private String categoria;

    @Column(nullable = false)
    private Double preco;

    @Column(nullable = false)
    private Integer duracaoMinutos;

    @Column(nullable = false)
    private Boolean ativo;

    @Column
    private Boolean publicado;

    @PrePersist
    public void prePersist() {
        if (this.categoria == null || this.categoria.isBlank()) {
            this.categoria = "Facial";
        }

        if (this.ativo == null) {
            this.ativo = true;
        }

        if (this.publicado == null) {
            this.publicado = true;
        }
    }
}
