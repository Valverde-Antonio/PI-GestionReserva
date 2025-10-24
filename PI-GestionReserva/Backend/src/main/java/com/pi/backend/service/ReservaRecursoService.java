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
        Recurso recurso = recursoRepository.findById(dto.getIdRecurso())
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        Profesor profesor = profesorRepository.findById(dto.getIdProfesor())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        ReservaRecurso reserva = new ReservaRecurso();
        reserva.setFecha(LocalDate.parse(dto.getFecha()));
        reserva.setTramoHorario(dto.getTramoHorario());
        reserva.setRecurso(recurso);
        reserva.setProfesor(profesor);

        return reservaRecursoRepository.save(reserva);
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
