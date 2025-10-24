package com.pi.backend.dto;

import com.pi.backend.model.ReservaRecurso;

public class ReservaRecursoResponseDTO {
    private Integer idReserva;
    private String fecha;
    private String tramoHorario;
    private String nombreRecurso;
    private String nombreProfesor;

    public ReservaRecursoResponseDTO() {}

    public ReservaRecursoResponseDTO(ReservaRecurso reserva) {
        this.idReserva = reserva.getIdReserva();
        this.fecha = reserva.getFecha() != null ? reserva.getFecha().toString() : null;
        this.tramoHorario = reserva.getTramoHorario();
        this.nombreRecurso = reserva.getRecurso() != null ? reserva.getRecurso().getNombre() : null;
        this.nombreProfesor = reserva.getProfesor() != null ? reserva.getProfesor().getNombre() : null;
    }

    public Integer getIdReserva() { return idReserva; }
    public void setIdReserva(Integer idReserva) { this.idReserva = idReserva; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getTramoHorario() { return tramoHorario; }
    public void setTramoHorario(String tramoHorario) { this.tramoHorario = tramoHorario; }
    public String getNombreRecurso() { return nombreRecurso; }
    public void setNombreRecurso(String nombreRecurso) { this.nombreRecurso = nombreRecurso; }
    public String getNombreProfesor() { return nombreProfesor; }
    public void setNombreProfesor(String nombreProfesor) { this.nombreProfesor = nombreProfesor; }
}
