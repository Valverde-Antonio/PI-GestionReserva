package com.pi.backend.dto;

public class ReservaRecursoDTO {

    private Integer idReserva;
    private String fecha;
    private String tramoHorario;
    private Integer idRecurso;
    private Integer idProfesor;
    private String nombreProfesor;
    private String nombreRecurso;

    public Integer getIdReserva() {
        return idReserva;
    }
    public void setIdReserva(Integer idReserva) {
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
    public Integer getIdRecurso() {
        return idRecurso;
    }
    public void setIdRecurso(Integer idRecurso) {
        this.idRecurso = idRecurso;
    }
    public Integer getIdProfesor() {
        return idProfesor;
    }
    public void setIdProfesor(Integer idProfesor) {
        this.idProfesor = idProfesor;
    }
    public String getNombreProfesor() {
        return nombreProfesor;
    }
    public void setNombreProfesor(String nombreProfesor) {
        this.nombreProfesor = nombreProfesor;
    }
    public String getNombreRecurso() {
        return nombreRecurso;
    }
    public void setNombreRecurso(String nombreRecurso) {
        this.nombreRecurso = nombreRecurso;
    }
}
