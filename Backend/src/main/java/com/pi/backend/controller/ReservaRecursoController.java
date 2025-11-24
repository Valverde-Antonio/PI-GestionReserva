package com.pi.backend.controller;

import com.pi.backend.dto.ReservaRecursoDTO;
import com.pi.backend.dto.ReservaRecursoResponseDTO;
import com.pi.backend.model.ReservaRecurso;
import com.pi.backend.service.ReservaRecursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar las reservas de recursos/materiales
 */
@RestController
@RequestMapping("/api/reservaRecurso")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReservaRecursoController {

    @Autowired
    private ReservaRecursoService reservaRecursoService;

    /**
     * Crea una nueva reserva de recurso
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody ReservaRecursoDTO dto) {
        try {
            ReservaRecurso reserva = reservaRecursoService.crearDesdeDTO(dto);
            
            ReservaRecursoDTO respuesta = new ReservaRecursoDTO();
            respuesta.setIdReserva(reserva.getIdReserva());
            respuesta.setFecha(reserva.getFecha().toString());
            respuesta.setTramoHorario(reserva.getTramoHorario());
            respuesta.setIdRecurso(reserva.getRecurso().getIdRecurso());
            respuesta.setIdProfesor(reserva.getProfesor().getIdProfesor());
            respuesta.setNombreRecurso(reserva.getRecurso().getNombre());
            respuesta.setNombreProfesor(reserva.getProfesor().getNombre());
            
            return ResponseEntity.ok(respuesta);
            
        } catch (RuntimeException e) {
            System.err.println("Error al crear reserva: " + e.getMessage());
            
            if (e.getMessage().contains("ya está reservado") || 
                e.getMessage().contains("Duplicate entry")) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
            } else if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
            } else if (e.getMessage().contains("inválido") || 
                       e.getMessage().contains("no puede ser null")) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
            }
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(e.getMessage());
                
        } catch (Exception e) {
            System.err.println("Error inesperado al crear reserva: " + e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error inesperado al crear la reserva: " + e.getMessage());
        }
    }

    /**
     * Actualiza una reserva de recurso existente
     */
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ReservaRecursoDTO dto) {
        try {
            ReservaRecurso reserva = reservaRecursoService.actualizarDesdeDTO(id, dto);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            System.err.println("Error al actualizar reserva: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar la reserva");
        }
    }

    /**
     * Elimina una reserva de recurso
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            reservaRecursoService.eliminar(id);
            return ResponseEntity.ok("Reserva eliminada correctamente");
        } catch (Exception e) {
            System.err.println("Error al eliminar reserva: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la reserva");
        }
    }

    /**
     * Busca reservas por fecha y nombre del material
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<ReservaRecursoResponseDTO>> buscarReservasPorFechaYMaterial(
            @RequestParam String fecha,
            @RequestParam String material) {
        try {            
            List<ReservaRecursoResponseDTO> resultado = reservaRecursoService.buscarPorFechaYMaterial(fecha, material);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.err.println("Error al buscar reservas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Filtra reservas por fecha, profesor y/o recurso
     */
    @GetMapping("/filtrar")
    public ResponseEntity<?> filtrarReservasRecurso(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) Long idProfesor,
            @RequestParam(required = false) Long idRecurso) {
        try {
            List<ReservaRecursoResponseDTO> resultado = reservaRecursoService.filtrarReservas(fecha, idProfesor, idRecurso);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.err.println("Error al filtrar reservas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al filtrar las reservas");
        }
    }

    /**
     * Obtiene todas las reservas de recursos
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodas() {
        try {
            List<ReservaRecurso> reservas = reservaRecursoService.obtenerTodas();
            List<ReservaRecursoDTO> dtoList = reservas.stream()
                    .map(reserva -> {
                        ReservaRecursoDTO dto = new ReservaRecursoDTO();
                        dto.setIdReserva(reserva.getIdReserva());
                        dto.setFecha(reserva.getFecha() != null ? reserva.getFecha().toString() : null);
                        dto.setTramoHorario(reserva.getTramoHorario());
                        dto.setIdRecurso(reserva.getRecurso() != null ? reserva.getRecurso().getIdRecurso() : null);
                        dto.setIdProfesor(reserva.getProfesor() != null ? reserva.getProfesor().getIdProfesor() : null);
                        dto.setNombreProfesor(reserva.getProfesor() != null ? reserva.getProfesor().getNombre() : null);
                        dto.setNombreRecurso(reserva.getRecurso() != null ? reserva.getRecurso().getNombre() : null);
                        return dto;
                    })
                    .toList();
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            System.err.println("Error al obtener reservas de recursos: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al obtener reservas de recursos");
        }
    }

    /**
     * Elimina una reserva de recurso (endpoint alternativo)
     */
    @DeleteMapping("/eliminarReserva/{id}")
    public ResponseEntity<?> eliminarReservaRecurso(@PathVariable Integer id) {
        try {
            reservaRecursoService.eliminarReservaRecurso(id);
            return ResponseEntity.ok("Reserva eliminada con éxito");
        } catch (Exception e) {
            System.err.println("Error al eliminar reserva de recurso: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al eliminar la reserva de recurso");
        }
    }

    /**
     * Verifica la disponibilidad de un recurso en una fecha y horario específicos
     */
    @GetMapping("/verificar-disponibilidad")
    public ResponseEntity<Map<String, Object>> verificarDisponibilidad(
            @RequestParam String fecha,
            @RequestParam String tramoHorario,
            @RequestParam Long idRecurso,
            @RequestParam(required = false) Long idReservaActual) {
        try {
            Map<String, Object> resultado = reservaRecursoService.verificarDisponibilidad(
                fecha, tramoHorario, idRecurso, idReservaActual
            );
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}