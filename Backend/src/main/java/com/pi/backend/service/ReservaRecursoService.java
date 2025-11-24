package com.pi.backend.service;

import com.pi.backend.dto.ReservaRecursoDTO;
import com.pi.backend.dto.ReservaRecursoResponseDTO;
import com.pi.backend.model.Profesor;
import com.pi.backend.model.Recurso;
import com.pi.backend.model.ReservaRecurso;
import com.pi.backend.repository.ReservaRecursoRepository;
import com.pi.backend.repository.RecursoRepository;
import com.pi.backend.repository.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de reservas de recursos/materiales
 */
@Service
public class ReservaRecursoService {

    @Autowired
    private ReservaRecursoRepository reservaRecursoRepository;

    @Autowired
    private RecursoRepository recursoRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    /**
     * Obtiene todas las reservas de recursos
     */
    public List<ReservaRecurso> obtenerTodas() {
        return reservaRecursoRepository.findAll();
    }

    /**
     * Crea una nueva reserva de recurso desde un DTO
     */
    public ReservaRecurso crearDesdeDTO(ReservaRecursoDTO dto) {
        try {
            if (dto.getIdRecurso() == null) {
                throw new IllegalArgumentException("El ID del recurso no puede ser null");
            }
            if (dto.getIdProfesor() == null) {
                throw new IllegalArgumentException("El ID del profesor no puede ser null");
            }

            Recurso recurso = recursoRepository.findById(dto.getIdRecurso())
                    .orElseThrow(() -> {
                        System.err.println("Recurso no encontrado con ID: " + dto.getIdRecurso());
                        return new RuntimeException("Recurso no encontrado con ID: " + dto.getIdRecurso());
                    });

            Profesor profesor = profesorRepository.findById(dto.getIdProfesor())
                    .orElseThrow(() -> {
                        System.err.println("Profesor no encontrado con ID: " + dto.getIdProfesor());
                        return new RuntimeException("Profesor no encontrado con ID: " + dto.getIdProfesor());
                    });

            LocalDate fecha;
            try {
                fecha = LocalDate.parse(dto.getFecha());
            } catch (Exception e) {
                System.err.println("Error al parsear fecha: " + dto.getFecha());
                throw new IllegalArgumentException("Formato de fecha inválido: " + dto.getFecha());
            }

            boolean existeReserva = reservaRecursoRepository
                    .existsByFechaAndTramoHorarioAndRecurso_IdRecurso(
                        fecha, 
                        dto.getTramoHorario(), 
                        dto.getIdRecurso()
                    );
            
            if (existeReserva) {
                String mensaje = "Este horario ya está reservado para este material";
                System.err.println(mensaje);
                throw new RuntimeException(mensaje);
            }

            ReservaRecurso reserva = new ReservaRecurso();
            reserva.setFecha(fecha);
            reserva.setTramoHorario(dto.getTramoHorario());
            reserva.setRecurso(recurso);
            reserva.setProfesor(profesor);

            ReservaRecurso saved = reservaRecursoRepository.save(reserva);
            return saved;
            
        } catch (DataIntegrityViolationException e) {
            System.err.println("Error de integridad de datos: " + e.getMessage());
            throw new RuntimeException("Este horario ya está reservado para este material");
        } catch (IllegalArgumentException e) {
            System.err.println("Error de validación: " + e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error inesperado al crear reserva: " + e.getMessage());
            throw new RuntimeException("Error al crear la reserva: " + e.getMessage());
        }
    }

    /**
     * Actualiza una reserva de recurso existente desde un DTO
     */
    public ReservaRecurso actualizarDesdeDTO(Integer id, ReservaRecursoDTO dto) {
        ReservaRecurso reserva = reservaRecursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        Recurso recurso = recursoRepository.findById(dto.getIdRecurso())
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        Profesor profesor = profesorRepository.findById(dto.getIdProfesor())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        reserva.setFecha(LocalDate.parse(dto.getFecha()));
        reserva.setTramoHorario(dto.getTramoHorario());
        reserva.setRecurso(recurso);
        reserva.setProfesor(profesor);

        return reservaRecursoRepository.save(reserva);
    }

    /**
     * Elimina una reserva de recurso por ID
     */
    public void eliminar(Integer id) {
        reservaRecursoRepository.deleteById(id);
    }

    /**
     * Busca reservas por fecha y nombre del material
     */
    public List<ReservaRecursoResponseDTO> buscarPorFechaYMaterial(String fecha, String material) {
        LocalDate fechaParseada = LocalDate.parse(fecha);
        List<ReservaRecurso> reservas = reservaRecursoRepository.findByFechaAndRecurso_Nombre(fechaParseada, material);
        return reservas.stream()
                .map(ReservaRecursoResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Filtra reservas por fecha, profesor y/o recurso
     */
    public List<ReservaRecursoResponseDTO> filtrarReservas(String fecha, Long idProfesor, Long idRecurso) {
        LocalDate fechaParseada = null;
        if (fecha != null && !fecha.isEmpty()) {
            fechaParseada = LocalDate.parse(fecha);
        }
        List<ReservaRecurso> reservas = reservaRecursoRepository.filtrarReservas(fechaParseada, idProfesor, idRecurso);
        return reservas.stream()
                .map(ReservaRecursoResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Elimina una reserva de recurso (método alternativo)
     */
    public void eliminarReservaRecurso(Integer id) throws Exception {
        ReservaRecurso reserva = reservaRecursoRepository.findById(id)
                .orElseThrow(() -> new Exception("Reserva no encontrada"));
        reservaRecursoRepository.delete(reserva);
    }

    /**
     * Verifica la disponibilidad de un recurso en una fecha y horario específicos
     */
    public Map<String, Object> verificarDisponibilidad(String fecha, String tramoHorario, Long idRecurso, Long idReservaActual) {
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            LocalDate fechaParseada = LocalDate.parse(fecha);
            
            List<ReservaRecurso> reservasExistentes = reservaRecursoRepository.findAll().stream()
                .filter(r -> r.getFecha().equals(fechaParseada) 
                          && r.getTramoHorario().equals(tramoHorario)
                          && r.getRecurso().getIdRecurso().equals(idRecurso.intValue()))
                .collect(Collectors.toList());
            
            if (idReservaActual != null) {
                reservasExistentes = reservasExistentes.stream()
                    .filter(r -> !r.getIdReserva().equals(idReservaActual.intValue()))
                    .collect(Collectors.toList());
            }
            
            if (reservasExistentes.isEmpty()) {
                resultado.put("disponible", true);
            } else {
                ReservaRecurso reservaConflicto = reservasExistentes.get(0);
                
                resultado.put("disponible", false);
                resultado.put("reservadoPor", reservaConflicto.getProfesor().getNombre());
                resultado.put("idReserva", reservaConflicto.getIdReserva());
                resultado.put("idProfesor", reservaConflicto.getProfesor().getIdProfesor());
            }
            
        } catch (Exception e) {
            System.err.println("Error al verificar disponibilidad: " + e.getMessage());
            resultado.put("error", e.getMessage());
        }
        
        return resultado;
    }
}