package com.gestionreserva.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class ReservaRecurso {
    private Integer idReserva;
    private LocalDate fecha;
    private String tramoHorario;
    private Recurso recurso;
    private Profesor profesor;

    public Integer getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Integer idReserva) {
        this.idReserva = idReserva;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getTramoHorario() {
        return tramoHorario;
    }

    public void setTramoHorario(String tramoHorario) {
        this.tramoHorario = tramoHorario;
    }

    public Recurso getRecurso() {
        return recurso;
    }

    public void setRecurso(Recurso recurso) {
        this.recurso = recurso;
    }

    public Profesor getProfesor() {
        return profesor;
    }

    public void setProfesor(Profesor profesor) {
        this.profesor = profesor;
    }
}