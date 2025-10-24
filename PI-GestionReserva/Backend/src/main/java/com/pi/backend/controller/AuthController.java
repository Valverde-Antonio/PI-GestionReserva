package com.pi.backend.controller;

import com.pi.backend.dto.LoginRequestDTO;
import com.pi.backend.dto.LoginResponseDTO;
import com.pi.backend.dto.RolDTO;
import com.pi.backend.model.Profesor;
import com.pi.backend.repository.ProfesorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ProfesorRepository profesorRepository;

    public AuthController(ProfesorRepository profesorRepository) {
        this.profesorRepository = profesorRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        Profesor profesor = profesorRepository.findByUsuarioAndClave(
                loginRequest.getUsuario(), loginRequest.getClave());

        if (profesor != null) {
            LoginResponseDTO responseDTO = new LoginResponseDTO();
            responseDTO.setIdProfesor(profesor.getIdProfesor());
            responseDTO.setUsuario(profesor.getUsuario());
            responseDTO.setNombre(profesor.getNombre());

            List<RolDTO> roles = profesor.getProfesoresRoles()
                    .stream()
                    .map(profRol -> {
                        RolDTO rolDTO = new RolDTO();
                        rolDTO.setNombre_rol(profRol.getRol().getNombreRol());
                        return rolDTO;
                    })
                    .collect(Collectors.toList());

            responseDTO.setRoles(roles);

            return ResponseEntity.ok(responseDTO);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
