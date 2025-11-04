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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaRecursoService {

    @Autowired
    private ReservaRecursoRepository reservaRecursoRepository;

    @Autowired
    private RecursoRepository recursoRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    public List<ReservaRecurso> obtenerTodas() {
        return reservaRecursoRepository.findAll();
    }

    public ReservaRecurso crearDesdeDTO(ReservaRecursoDTO dto) {
        try {
            System.out.println("🎯 Iniciando creación de reserva con datos:");
            System.out.println("  - Fecha: " + dto.getFecha());
            System.out.println("  - Tramo: " + dto.getTramoHorario());
            System.out.println("  - ID Recurso: " + dto.getIdRecurso());
            System.out.println("  - ID Profesor: " + dto.getIdProfesor());

            // Validar que los IDs no sean null
            if (dto.getIdRecurso() == null) {
                throw new IllegalArgumentException("El ID del recurso no puede ser null");
            }
            if (dto.getIdProfesor() == null) {
                throw new IllegalArgumentException("El ID del profesor no puede ser null");
            }

            // Buscar recurso
            Recurso recurso = recursoRepository.findById(dto.getIdRecurso())
                    .orElseThrow(() -> {
                        System.err.println("❌ Recurso no encontrado con ID: " + dto.getIdRecurso());
                        return new RuntimeException("Recurso no encontrado con ID: " + dto.getIdRecurso());
                    });
            System.out.println("✅ Recurso encontrado: " + recurso.getNombre());

            // Buscar profesor
            Profesor profesor = profesorRepository.findById(dto.getIdProfesor())
                    .orElseThrow(() -> {
                        System.err.println("❌ Profesor no encontrado con ID: " + dto.getIdProfesor());
                        return new RuntimeException("Profesor no encontrado con ID: " + dto.getIdProfesor());
                    });
            System.out.println("✅ Profesor encontrado: " + profesor.getNombre());

            // Validar fecha
            LocalDate fecha;
            try {
                fecha = LocalDate.parse(dto.getFecha());
                System.out.println("✅ Fecha parseada correctamente: " + fecha);
            } catch (Exception e) {
                System.err.println("❌ Error al parsear fecha: " + dto.getFecha());
                throw new IllegalArgumentException("Formato de fecha inválido: " + dto.getFecha());
            }

            // Verificar si ya existe una reserva con los mismos datos
            List<ReservaRecurso> reservasExistentes = reservaRecursoRepository
                    .findByFechaAndRecurso_Nombre(fecha, recurso.getNombre());
            
            System.out.println("📋 Reservas existentes para esta fecha y recurso: " + reservasExistentes.size());
            
            for (ReservaRecurso r : reservasExistentes) {
                System.out.println("  - Tramo existente: '" + r.getTramoHorario() + "'");
                System.out.println("  - Tramo nuevo: '" + dto.getTramoHorario() + "'");
                System.out.println("  - ¿Son iguales? " + r.getTramoHorario().equals(dto.getTramoHorario()));
                
                if (r.getTramoHorario().equals(dto.getTramoHorario())) {
                    String mensaje = "Este horario ya está reservado para este material";
                    System.err.println("❌ " + mensaje);
                    throw new DataIntegrityViolationException(mensaje);
                }
            }

            // Crear la reserva
            ReservaRecurso reserva = new ReservaRecurso();
            reserva.setFecha(fecha);
            reserva.setTramoHorario(dto.getTramoHorario());
            reserva.setRecurso(recurso);
            reserva.setProfesor(profesor);

            System.out.println("💾 Guardando reserva en la base de datos...");
            ReservaRecurso saved = reservaRecursoRepository.save(reserva);
            System.out.println("✅ Reserva creada exitosamente con ID: " + saved.getIdReserva());
            
            return saved;
            
        } catch (DataIntegrityViolationException e) {
            System.err.println("❌ Error de integridad de datos: " + e.getMessage());
            throw new RuntimeException("Este horario ya está reservado para este material");
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Error de validación: " + e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Error inesperado al crear reserva:");
            e.printStackTrace();
            throw new RuntimeException("Error al crear la reserva: " + e.getMessage());
        }
    }

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

    public void eliminar(Integer id) {
        reservaRecursoRepository.deleteById(id);
    }

    public List<ReservaRecursoResponseDTO> buscarPorFechaYMaterial(String fecha, String material) {
        LocalDate fechaParseada = LocalDate.parse(fecha);
        List<ReservaRecurso> reservas = reservaRecursoRepository.findByFechaAndRecurso_Nombre(fechaParseada, material);
        return reservas.stream()
                .map(ReservaRecursoResponseDTO::new)
                .collect(Collectors.toList());
    }

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

    public void eliminarReservaRecurso(Integer id) throws Exception {
        ReservaRecurso reserva = reservaRecursoRepository.findById(id)
                .orElseThrow(() -> new Exception("Reserva no encontrada"));
        reservaRecursoRepository.delete(reserva);
    }
}