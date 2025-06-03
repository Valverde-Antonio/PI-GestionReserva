package com.pi.backend.controller;

import com.pi.backend.model.Usuario;
import com.pi.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public Usuario login(@RequestBody Usuario loginRequest) {
        Optional<Usuario> usuario = usuarioService.findByEmail(loginRequest.getEmail());

        if (usuario.isPresent() && usuario.get().getPassword().equals(loginRequest.getPassword())) {
            return usuario.get();
        } else {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }
    }
}
