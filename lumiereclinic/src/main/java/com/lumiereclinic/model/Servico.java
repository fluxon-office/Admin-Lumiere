package com.lumiereclinic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Column(nullable = false)
    private String descricao;

    @Column
    private String categoria;

    @DecimalMin(value = "0.01")
    @Column(nullable = false)
    private Double preco;

    @Min(1)
    @Column(nullable = false)
    private Integer duracaoMinutos;

    @NotBlank
    @Column(name = "profissional_principal", nullable = false)
    private String profissionalPrincipal;

    @Column(nullable = false)
    private Boolean ativo;

    @Column
    private Boolean publicado;

    @Column(name = "empresa_id", nullable = false)
    private String empresaId;

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

        if (this.empresaId == null || this.empresaId.isBlank()) {
            this.empresaId = "lumiere-clinic";
        }
    }
}
