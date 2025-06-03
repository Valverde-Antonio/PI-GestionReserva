package com.pi.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class ReservaRecurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private int cantidad;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Recurso recurso;
}
