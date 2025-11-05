package com.pi.backend.dto;

import com.pi.backend.model.ReservaEspacio;

public class ReservaEspacioResponseDTO {

    private Long idReserva;
    private String fecha;
    private String tramoHorario;
    private String nombreEspacio;
    private String nombreProfesor;
    private Long idEspacio;
    private Long idProfesor;

    public ReservaEspacioResponseDTO() {}

    // Constructor desde entidad
    public ReservaEspacioResponseDTO(ReservaEspacio reserva) {
        this.idReserva = reserva.getIdReserva().longValue();
        this.fecha = reserva.getFecha().toString();
        this.tramoHorario = reserva.getTramoHorario();
        this.nombreEspacio = reserva.getEspacio() != null ? reserva.getEspacio().getNombre() : null;
        this.nombreProfesor = reserva.getProfesor() != null ? reserva.getProfesor().getNombre() : null;
        this.idEspacio = reserva.getEspacio() != null ? reserva.getEspacio().getIdEspacio().longValue() : null;
        this.idProfesor = reserva.getProfesor() != null ? reserva.getProfesor().getIdProfesor().longValue() : null;
    }

    // Getters y setters
    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getTramoHorario() {
        return tramoHorario;
    }

    public void setTramoHorario(String tramoHorario) {
        this.tramoHorario = tramoHorario;
    }

    public String getNombreEspacio() {
        return nombreEspacio;
    }

    public void setNombreEspacio(String nombreEspacio) {
        this.nombreEspacio = nombreEspacio;
    }

    public String getNombreProfesor() {
        return nombreProfesor;
    }

    public void setNombreProfesor(String nombreProfesor) {
        this.nombreProfesor = nombreProfesor;
    }

    public Long getIdEspacio() {
        return idEspacio;
    }

    public void setIdEspacio(Long idEspacio) {
        this.idEspacio = idEspacio;
    }

    public Long getIdProfesor() {
        return idProfesor;
    }

    public void setIdProfesor(Long idProfesor) {
        this.idProfesor = idProfesor;
    }
}