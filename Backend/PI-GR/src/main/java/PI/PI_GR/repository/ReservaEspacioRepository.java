package com.gestionreserva.repository;

import com.gestionreserva.model.ReservaEspacio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaEspacioRepository extends JpaRepository<ReservaEspacio, Integer> {

}