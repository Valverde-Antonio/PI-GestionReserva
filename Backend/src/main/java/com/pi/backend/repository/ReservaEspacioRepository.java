package com.pi.backend.repository;

import com.pi.backend.model.ReservaEspacio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaEspacioRepository extends JpaRepository<ReservaEspacio, Integer> {
    List<ReservaEspacio> findByFechaAndEspacioNombre(LocalDate fecha, String nombreEspacio);

    @Query("SELECT r FROM ReservaEspacio r WHERE " +
       "(:fecha IS NULL OR r.fecha = :fecha) AND " +
       "(:idProfesor IS NULL OR r.profesor.idProfesor = :idProfesor) AND " +
       "(:idEspacio IS NULL OR r.espacio.idEspacio = :idEspacio)")
List<ReservaEspacio> filtrarReservas(@Param("fecha") LocalDate fecha,
                                     @Param("idProfesor") Long idProfesor,
                                     @Param("idEspacio") Long idEspacio);




List<ReservaEspacio> findByFechaAndEspacio_Nombre(LocalDate fecha, String nombreEspacio);

@Query("SELECT DISTINCT r.tramoHorario FROM ReservaEspacio r ORDER BY r.tramoHorario")
List<String> findDistinctTramoHorarios();

}


