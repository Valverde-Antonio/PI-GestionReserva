package com.pi.backend.repository;

import com.pi.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Integer> {
    Rol findByNombreRol(String nombreRol);
}
