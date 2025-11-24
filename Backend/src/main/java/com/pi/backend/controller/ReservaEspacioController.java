package com.pi.backend.controller;

import com.pi.backend.dto.ReservaEspacioDTO;
import com.pi.backend.dto.ReservaEspacioResponseDTO;
import com.pi.backend.model.ReservaEspacio;
import com.pi.backend.service.ReservaEspacioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar las reservas de espacios/aulas
 */
@RestController
@RequestMapping("/api/reservaEspacio")
@CrossOrigin(origins = "*")
public class ReservaEspacioController {

    @Autowired
    private ReservaEspacioService reservaEspacioService;

    /**
     * Obtiene todas las reservas de espacios
     */
    @GetMapping
    public ResponseEntity<?> obtenerReservas() {
        try {
            List<ReservaEspacio> reservas = reservaEspacioService.obtenerTodas();
            List<ReservaEspacioResponseDTO> dtoList = reservas.stream()
                    .map(reserva -> {
                        ReservaEspacioResponseDTO dto = new ReservaEspacioResponseDTO(reserva);
                        if (reserva.getProfesor() != null) {
                            dto.setIdProfesor(reserva.getProfesor().getIdProfesor().longValue());
                        }
                        return dto;
                    })
                    .toList();
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            System.err.println("Error al obtener reservas de espacios: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al obtener reservas de espacios");
        }
    }

    /**
     * Busca reservas por fecha y nombre del aula
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<ReservaEspacioDTO>> buscarPorFechaYAula(
            @RequestParam String fecha,
            @RequestParam String aula) {
        List<ReservaEspacioDTO> reservas = reservaEspacioService.buscarPorFechaYAula(fecha, aula);
        return ResponseEntity.ok(reservas);
    }

    /**
     * Crea una nueva reserva de espacio
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearReserva(@RequestBody ReservaEspacioDTO dto) {
        try {
            reservaEspacioService.guardarReserva(dto);
            return ResponseEntity.ok(Map.of("mensaje", "Reserva creada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Error: la reserva ya existe o no se pudo guardar.");
        }
    }

    /**
     * Actualiza una reserva de espacio existente
     */
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id, @RequestBody ReservaEspacioDTO dto) {
        try {
            reservaEspacioService.actualizarReserva(id.intValue(), dto);
            return ResponseEntity.ok("Reserva actualizada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar reserva");
        }
    }

    /**
     * Elimina una reserva de espacio
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id) {
        try {
            reservaEspacioService.eliminarReserva(id.intValue());
            return ResponseEntity.ok("Reserva eliminada correctamente");
        } catch (RuntimeException e) {
            System.err.println("Error al eliminar reserva: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error inesperado al eliminar reserva: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar reserva");
        }
    }

    /**
     * Filtra reservas por fecha, profesor y/o espacio
     */
    @GetMapping("/filtrar")
    public List<ReservaEspacioResponseDTO> filtrarReservasEspacio(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) Long idProfesor,
            @RequestParam(required = false) Long idEspacio
    ) {
        return reservaEspacioService.filtrarReservas(fecha, idProfesor, idEspacio);
    }

    /**
     * Obtiene los turnos disponibles
     */
    @GetMapping("/turnos")
    public List<String> obtenerTurnos() {
        return reservaEspacioService.obtenerTurnosDisponibles();
    }

    /**
     * Verifica la disponibilidad de un espacio en una fecha y horario específicos
     */
    @GetMapping("/verificar-disponibilidad")
    public ResponseEntity<Map<String, Object>> verificarDisponibilidad(
            @RequestParam String fecha,
            @RequestParam String tramoHorario,
            @RequestParam Long idEspacio,
            @RequestParam(required = false) Long idReservaActual) {
        try {
            Map<String, Object> resultado = reservaEspacioService.verificarDisponibilidad(
                fecha, tramoHorario, idEspacio, idReservaActual
            );
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}