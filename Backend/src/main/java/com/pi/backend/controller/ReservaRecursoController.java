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

@RestController
@RequestMapping("/api/reservaRecurso")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReservaRecursoController {

    @Autowired
    private ReservaRecursoService reservaRecursoService;

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody ReservaRecursoDTO dto) {
        try {
            ReservaRecurso reserva = reservaRecursoService.crearDesdeDTO(dto);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al crear la reserva");
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ReservaRecursoDTO dto) {
        try {
            ReservaRecurso reserva = reservaRecursoService.actualizarDesdeDTO(id, dto);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar la reserva");
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            reservaRecursoService.eliminar(id);
            return ResponseEntity.ok("Reserva eliminada correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la reserva");
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ReservaRecursoResponseDTO>> buscarReservasPorFechaYMaterial(
            @RequestParam String fecha,
            @RequestParam String material) {
        try {
            List<ReservaRecursoResponseDTO> resultado = reservaRecursoService.buscarPorFechaYMaterial(fecha, material);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/filtrar")
    public ResponseEntity<?> filtrarReservasRecurso(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) Long idProfesor,
            @RequestParam(required = false) Long idRecurso) {
        try {
            List<ReservaRecursoResponseDTO> resultado = reservaRecursoService.filtrarReservas(fecha, idProfesor, idRecurso);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al filtrar las reservas");
        }
    }

    // Nota: tu base @RequestMapping ya es /api/reservaRecurso; aquí no repito la ruta completa
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
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al obtener reservas de recursos");
        }
    }

    @DeleteMapping("/eliminarReserva/{id}")
    public ResponseEntity<?> eliminarReservaRecurso(@PathVariable Integer id) {
        try {
            reservaRecursoService.eliminarReservaRecurso(id);
            return ResponseEntity.ok("Reserva eliminada con éxito");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al eliminar la reserva de recurso");
        }
    }
}
