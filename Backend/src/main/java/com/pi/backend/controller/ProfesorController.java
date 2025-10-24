package com.pi.backend.controller;

import com.pi.backend.dto.ProfesorDTO;
import com.pi.backend.service.ProfesorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesores")
@CrossOrigin(origins = "*")
public class ProfesorController {

    @Autowired
    private ProfesorService profesorService;

    @GetMapping
    public ResponseEntity<List<ProfesorDTO>> obtenerTodos() {
        return ResponseEntity.ok(profesorService.obtenerTodosLosProfesoresDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfesorDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(profesorService.obtenerPorId(id));
    }
}
