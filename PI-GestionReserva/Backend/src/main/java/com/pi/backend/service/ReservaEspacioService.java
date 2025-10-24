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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaEspacioService {

    @Autowired
    private ReservaEspacioRepository reservaEspacioRepository;

    public List<ReservaEspacio> obtenerTodas() {
        return reservaEspacioRepository.findAll();
    }

    public List<ReservaEspacioDTO> buscarPorFechaYAula(String fecha, String nombreAula) {
        LocalDate fechaParseada = LocalDate.parse(fecha); // ✅ Conversión necesaria
        List<ReservaEspacio> reservas = reservaEspacioRepository.findByFechaAndEspacio_Nombre(fechaParseada, nombreAula);

        return reservas.stream().map(reserva -> {
            ReservaEspacioDTO dto = new ReservaEspacioDTO();
            dto.setIdReserva(reserva.getIdReserva().longValue());
            dto.setFecha(reserva.getFecha().toString()); // ✅ Conversión necesaria
            dto.setTramoHorario(reserva.getTramoHorario());
            dto.setIdEspacio(reserva.getEspacio().getIdEspacio().longValue());
            dto.setIdProfesor(reserva.getProfesor().getIdProfesor().longValue());
            dto.setNombreEspacio(reserva.getEspacio().getNombre());
            dto.setNombreProfesor(reserva.getProfesor().getNombre());
            return dto;
        }).collect(Collectors.toList());
    }

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

    public void eliminarReserva(int id) {
    if (reservaEspacioRepository.existsById(id)) {
        reservaEspacioRepository.deleteById(id);
        reservaEspacioRepository.flush(); // 👈 Fuerza sincronización inmediata con la BD
        System.out.println("Reserva eliminada correctamente. ID: " + id);
    } else {
        System.err.println("Error: No existe una reserva con ID: " + id);
        throw new RuntimeException("No existe la reserva con ID: " + id);
    }
}



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


    public List<ReservaEspacioResponseDTO> filtrarReservas(String fecha, Long idProfesor, Long idEspacio) {
    LocalDate fechaParseada = (fecha != null && !fecha.isEmpty()) ? LocalDate.parse(fecha) : null;
    List<ReservaEspacio> reservas = reservaEspacioRepository.filtrarReservas(fechaParseada, idProfesor, idEspacio);
    return reservas.stream().map(this::convertirADTO).collect(Collectors.toList());
}

public List<String> obtenerTurnosDisponibles() {
    return reservaEspacioRepository.findDistinctTramoHorarios();
}



}
