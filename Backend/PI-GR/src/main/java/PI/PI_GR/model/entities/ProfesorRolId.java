package com.gestionreserva.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class ProfesorRolId {
    private Integer idProfesor;
    private Integer idRol;

    public Integer getIdProfesor() {
        return idProfesor;
    }

    public void setIdProfesor(Integer idProfesor) {
        this.idProfesor = idProfesor;
    }

    public Integer getIdRol() {
        return idRol;
    }

    public void setIdRol(Integer idRol) {
        this.idRol = idRol;
    }
}