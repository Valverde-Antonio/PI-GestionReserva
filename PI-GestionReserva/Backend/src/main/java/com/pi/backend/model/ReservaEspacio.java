package com.pi.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservas_espacios", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"fecha", "tramo_horario", "id_espacio"})
})
public class ReservaEspacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Integer idReserva;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "tramo_horario", nullable = false, length = 50)
    private String tramoHorario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_espacio", nullable = false)
    private Espacio espacio;

    @ManyToOne(fetch = FetchType.LAZY)
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

    public Espacio getEspacio() {
        return espacio;
    }

    public void setEspacio(Espacio espacio) {
        this.espacio = espacio;
    }

    public Profesor getProfesor() {
        return profesor;
    }

    public void setProfesor(Profesor profesor) {
        this.profesor = profesor;
    }
}
