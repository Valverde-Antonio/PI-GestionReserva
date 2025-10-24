package com.pi.backend.service;

import com.pi.backend.dto.ProfesorDTO;
import com.pi.backend.model.Profesor;
import com.pi.backend.repository.ProfesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfesorService {

    @Autowired
    private ProfesorRepository profesorRepository;

    public List<ProfesorDTO> obtenerTodosLosProfesoresDTO() {
        List<Profesor> profesores = profesorRepository.findAll();
        return profesores.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public ProfesorDTO obtenerPorId(Integer id) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado con ID: " + id));
        return convertirADTO(profesor);
    }

    public ProfesorDTO crearProfesor(Profesor profesor) {
        Profesor nuevo = profesorRepository.save(profesor);
        return convertirADTO(nuevo);
    }

    public ProfesorDTO actualizarProfesor(Integer id, Profesor profesorActualizado) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado con ID: " + id));

        profesor.setNombre(profesorActualizado.getNombre());
        profesor.setUsuario(profesorActualizado.getUsuario());
        profesor.setClave(profesorActualizado.getClave());
        profesor.setDni(profesorActualizado.getDni());
        profesor.setEmail(profesorActualizado.getEmail());
        profesor.setCursoAcademico(profesorActualizado.getCursoAcademico());
        profesor.setDepartamento(profesorActualizado.getDepartamento());
        profesor.setAlias(profesorActualizado.getAlias());

        return convertirADTO(profesorRepository.save(profesor));
    }

    public void eliminarProfesor(Integer id) {
        profesorRepository.deleteById(id);
    }

    // === Conversión ===
    private ProfesorDTO convertirADTO(Profesor profesor) {
        ProfesorDTO dto = new ProfesorDTO();
        dto.setIdProfesor(profesor.getIdProfesor());
        dto.setUsuario(profesor.getUsuario());
        dto.setNombre(profesor.getNombre());
        dto.setDni(profesor.getDni());
        dto.setEmail(profesor.getEmail());
        dto.setCursoAcademico(profesor.getCursoAcademico());
        dto.setDepartamento(profesor.getDepartamento());
        dto.setAlias(profesor.getAlias());
        return dto;
    }
}
