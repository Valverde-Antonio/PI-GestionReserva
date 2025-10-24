package com.pi.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "espacios")
public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_espacio")
    private Integer idEspacio;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    public Integer getIdEspacio() {
        return idEspacio;
    }

    public void setIdEspacio(Integer idEspacio) {
        this.idEspacio = idEspacio;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
