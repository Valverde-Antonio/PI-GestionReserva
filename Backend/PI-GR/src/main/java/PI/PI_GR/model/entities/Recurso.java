package com.gestionreserva.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class Recurso {
    private Integer idRecurso;
    private String nombre;

    public Integer getIdRecurso() {
        return idRecurso;
    }

    public void setIdRecurso(Integer idRecurso) {
        this.idRecurso = idRecurso;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}