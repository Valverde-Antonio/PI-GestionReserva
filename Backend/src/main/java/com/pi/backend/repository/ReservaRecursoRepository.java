package com.pi.backend.repository;

import com.pi.backend.model.ReservaRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRecursoRepository extends JpaRepository<ReservaRecurso, Integer> {

    // Consulta directa usando el nombre del recurso
    List<ReservaRecurso> findByFechaAndRecurso_Nombre(LocalDate fecha, String nombre);

    // Consulta personalizada con filtros opcionales para recursos
    @Query("SELECT r FROM ReservaRecurso r WHERE " +
           "(:fecha IS NULL OR r.fecha = :fecha) AND " +
           "(:idProfesor IS NULL OR r.profesor.idProfesor = :idProfesor) AND " +
           "(:idRecurso IS NULL OR r.recurso.idRecurso = :idRecurso)")
    List<ReservaRecurso> filtrarReservas(@Param("fecha") LocalDate fecha,
                                         @Param("idProfesor") Long idProfesor,
                                         @Param("idRecurso") Long idRecurso);
}
