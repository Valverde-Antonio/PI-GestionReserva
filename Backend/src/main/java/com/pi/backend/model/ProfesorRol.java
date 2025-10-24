package com.pi.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "profesores_roles")
public class ProfesorRol {

    @EmbeddedId
    private ProfesorRolId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idProfesor")
    @JoinColumn(name = "id_profesor")
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idRol")
    @JoinColumn(name = "id_rol")
    private Rol rol;

    @Column(name = "grupo_tutoria", length = 50)
    private String grupoTutoria;

    // Getters y setters

    public ProfesorRolId getId() {
        return id;
    }

    public void setId(ProfesorRolId id) {
        this.id = id;
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

    public String getGrupoTutoria() {
        return grupoTutoria;
    }

    public void setGrupoTutoria(String grupoTutoria) {
        this.grupoTutoria = grupoTutoria;
    }
}
