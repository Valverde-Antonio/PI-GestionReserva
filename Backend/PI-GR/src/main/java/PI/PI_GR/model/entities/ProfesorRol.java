package com.gestionreserva.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class ProfesorRol {
    private ProfesorRolId id;
    private String grupoTutoria;
    private Profesor profesor;
    private Rol rol;

    public ProfesorRolId getId() {
        return id;
    }

    public void setId(ProfesorRolId id) {
        this.id = id;
    }

    public String getGrupoTutoria() {
        return grupoTutoria;
    }

    public void setGrupoTutoria(String grupoTutoria) {
        this.grupoTutoria = grupoTutoria;
    }

    public Profesor getProfesor() {
        return profesor;
    }

    public void setProfesor(Profesor profesor) {
        this.profesor = profesor;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }
}