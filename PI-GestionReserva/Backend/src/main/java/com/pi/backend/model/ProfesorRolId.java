package com.pi.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProfesorRolId implements Serializable {

    @Column(name = "id_profesor")
    private Integer idProfesor;

    @Column(name = "id_rol")
    private Integer idRol;

    public ProfesorRolId() {}

    public ProfesorRolId(Integer idProfesor, Integer idRol) {
        this.idProfesor = idProfesor;
        this.idRol = idRol;
    }

    // Getters y setters

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

    // equals y hashCode para clave compuesta

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProfesorRolId)) return false;
        ProfesorRolId that = (ProfesorRolId) o;
        return Objects.equals(getIdProfesor(), that.getIdProfesor()) &&
               Objects.equals(getIdRol(), that.getIdRol());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getIdProfesor(), getIdRol());
    }
}
