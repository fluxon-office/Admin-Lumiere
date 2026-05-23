package com.lumiereclinic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.lumiereclinic.enums.StatusAgendamento;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "agendamentos",
        uniqueConstraints = @UniqueConstraint(name = "uk_agendamento_servico_horario", columnNames = {"servico_id", "data_hora"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAgendamento status;

    @Column(length = 500)
    private String observacao;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String whatsappUrl;

    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String whatsappMensagem;

    @PrePersist
    public void prePersist() {
        this.criadoEm = LocalDateTime.now();

        if (this.status == null) {
            this.status = StatusAgendamento.PENDENTE;
        }
    }
}
