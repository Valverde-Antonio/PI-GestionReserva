package com.gestionreserva.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class Rol {
    private Integer idRol;
    private String nombreRol;

    public Integer getIdRol() {
        return idRol;
    }

    public void setIdRol(Integer idRol) {
        this.idRol = idRol;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }
}