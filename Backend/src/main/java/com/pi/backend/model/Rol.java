package com.pi.backend.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre_rol", unique = true, nullable = false, length = 50)
    private String nombreRol;

    @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ProfesorRol> profesoresRoles;

    // Getters y setters

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

    public Set<ProfesorRol> getProfesoresRoles() {
        return profesoresRoles;
    }

    public void setProfesoresRoles(Set<ProfesorRol> profesoresRoles) {
        this.profesoresRoles = profesoresRoles;
    }
}
