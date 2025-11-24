package com.pi.backend.service;

import com.pi.backend.dto.ReservaEspacioDTO;
import com.pi.backend.dto.ReservaEspacioResponseDTO;
import com.pi.backend.model.Espacio;
import com.pi.backend.model.Profesor;
import com.pi.backend.model.ReservaEspacio;
import com.pi.backend.repository.ReservaEspacioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de reservas de espacios/aulas
 */
@Service
public class ReservaEspacioService {

    @Autowired
    private ReservaEspacioRepository reservaEspacioRepository;

    /**
     * Obtiene todas las reservas de espacios
     */
    public List<ReservaEspacio> obtenerTodas() {
        return reservaEspacioRepository.findAll();
    }

    /**
     * Busca reservas por fecha y nombre del aula
     */
    public List<ReservaEspacioDTO> buscarPorFechaYAula(String fecha, String nombreAula) {
        LocalDate fechaParseada = LocalDate.parse(fecha);
        List<ReservaEspacio> reservas = reservaEspacioRepository.findByFechaAndEspacio_Nombre(fechaParseada, nombreAula);

        return reservas.stream().map(reserva -> {
            ReservaEspacioDTO dto = new ReservaEspacioDTO();
            dto.setIdReserva(reserva.getIdReserva().longValue());
            dto.setFecha(reserva.getFecha().toString());
            dto.setTramoHorario(reserva.getTramoHorario());
            dto.setIdEspacio(reserva.getEspacio().getIdEspacio().longValue());
            dto.setIdProfesor(reserva.getProfesor().getIdProfesor().longValue());
            dto.setNombreEspacio(reserva.getEspacio().getNombre());
            dto.setNombreProfesor(reserva.getProfesor().getNombre());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Guarda una nueva reserva de espacio
     */
    public ReservaEspacio guardarReserva(ReservaEspacioDTO dto) {
        ReservaEspacio reserva = new ReservaEspacio();
        reserva.setFecha(LocalDate.parse(dto.getFecha()));
        reserva.setTramoHorario(dto.getTramoHorario());

        Espacio espacio = new Espacio();
        espacio.setIdEspacio(dto.getIdEspacio().intValue());
        reserva.setEspacio(espacio);

        Profesor profesor = new Profesor();
        profesor.setIdProfesor(dto.getIdProfesor().intValue());
        reserva.setProfesor(profesor);

        return reservaEspacioRepository.save(reserva);
    }

    /**
     * Actualiza una reserva de espacio existente
     */
    public void actualizarReserva(int id, ReservaEspacioDTO dto) {
        ReservaEspacio reserva = reservaEspacioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setFecha(LocalDate.parse(dto.getFecha()));
        reserva.setTramoHorario(dto.getTramoHorario());

        Espacio espacio = new Espacio();
        espacio.setIdEspacio(dto.getIdEspacio().intValue());
        reserva.setEspacio(espacio);

        Profesor profesor = new Profesor();
        profesor.setIdProfesor(dto.getIdProfesor().intValue());
        reserva.setProfesor(profesor);

        reservaEspacioRepository.save(reserva);
    }

    /**
     * Elimina una reserva de espacio
     */
    public void eliminarReserva(int id) {
        if (reservaEspacioRepository.existsById(id)) {
            reservaEspacioRepository.deleteById(id);
            reservaEspacioRepository.flush();
        } else {
            System.err.println("Error: No existe una reserva con ID: " + id);
            throw new RuntimeException("No existe la reserva con ID: " + id);
        }
    }

    /**
     * Verifica la disponibilidad de un espacio en una fecha y horario específicos
     */
    public Map<String, Object> verificarDisponibilidad(String fecha, String tramoHorario, Long idEspacio, Long idReservaActual) {
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            LocalDate fechaParseada = LocalDate.parse(fecha);
            
            List<ReservaEspacio> reservasExistentes = reservaEspacioRepository.findAll().stream()
                .filter(r -> r.getFecha().equals(fechaParseada) 
                          && r.getTramoHorario().equals(tramoHorario)
                          && r.getEspacio().getIdEspacio().equals(idEspacio.intValue()))
                .collect(Collectors.toList());
            
            if (idReservaActual != null) {
                reservasExistentes = reservasExistentes.stream()
                    .filter(r -> !r.getIdReserva().equals(idReservaActual.intValue()))
                    .collect(Collectors.toList());
            }
            
            if (reservasExistentes.isEmpty()) {
                resultado.put("disponible", true);
            } else {
                ReservaEspacio reservaConflicto = reservasExistentes.get(0);
                
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

    /**
     * Convierte una entidad ReservaEspacio a DTO
     */
    private ReservaEspacioResponseDTO convertirADTO(ReservaEspacio reserva) {
        ReservaEspacioResponseDTO dto = new ReservaEspacioResponseDTO();
        dto.setIdReserva(reserva.getIdReserva().longValue());
        dto.setFecha(reserva.getFecha().toString());
        dto.setTramoHorario(reserva.getTramoHorario());

        if (reserva.getEspacio() != null) {
            dto.setNombreEspacio(reserva.getEspacio().getNombre());
            dto.setIdEspacio(reserva.getEspacio().getIdEspacio().longValue());
        }

        if (reserva.getProfesor() != null) {
            dto.setNombreProfesor(reserva.getProfesor().getNombre());
            dto.setIdProfesor(reserva.getProfesor().getIdProfesor().longValue());
        }

        return dto;
    }

    /**
     * Filtra reservas por fecha, profesor y/o espacio
     */
    public List<ReservaEspacioResponseDTO> filtrarReservas(String fecha, Long idProfesor, Long idEspacio) {
        LocalDate fechaParseada = (fecha != null && !fecha.isEmpty()) ? LocalDate.parse(fecha) : null;
        List<ReservaEspacio> reservas = reservaEspacioRepository.filtrarReservas(fechaParseada, idProfesor, idEspacio);
        return reservas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    /**
     * Obtiene los turnos/tramos horarios disponibles
     */
    public List<String> obtenerTurnosDisponibles() {
        return reservaEspacioRepository.findDistinctTramoHorarios();
    }
}