package com.pi.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LoginResponseDTO {
    private Integer idProfesor;
    private String usuario;
    private String nombre;
    private List<RolDTO> roles;
}
