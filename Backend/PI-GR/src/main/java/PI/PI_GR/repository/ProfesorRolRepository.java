package com.gestionreserva.repository;

import com.gestionreserva.model.ProfesorRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfesorRolRepository extends JpaRepository<ProfesorRol, Integer> {

}