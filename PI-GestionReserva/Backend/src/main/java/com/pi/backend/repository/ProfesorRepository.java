package com.pi.backend.repository;

import com.pi.backend.model.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfesorRepository extends JpaRepository<Profesor, Integer> {
    Profesor findByUsuarioAndClave(String usuario, String clave);
}
