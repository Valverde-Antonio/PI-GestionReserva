package com.gestionreserva.repository;

import com.gestionreserva.model.ReservaRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRecursoRepository extends JpaRepository<ReservaRecurso, Integer> {

}