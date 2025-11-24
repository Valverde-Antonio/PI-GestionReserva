package com.pi.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "reservas_recursos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"fecha", "tramo_horario", "id_recurso"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) 
public class ReservaRecurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Integer idReserva;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "tramo_horario", nullable = false, length = 50)
    private String tramoHorario;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "id_recurso", nullable = false)
private Recurso recurso;

@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "id_profesor", nullable = false)
private Profesor profesor;


    // Getters y setters

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
