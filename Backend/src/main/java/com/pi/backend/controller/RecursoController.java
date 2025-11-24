package com.pi.backend.controller;

import com.pi.backend.model.Recurso;
import com.pi.backend.repository.RecursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recursos") 
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecursoController {

    @Autowired
    private RecursoRepository recursoRepository;
@GetMapping
public ResponseEntity<?> obtenerTodos() {
    try {
        List<Recurso> recursos = recursoRepository.findAll();
        return ResponseEntity.ok(recursos);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Error al obtener recursos");
    }
}


    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Recurso recurso) {
        try {
            return ResponseEntity.ok(recursoRepository.save(recurso));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al crear recurso");
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Recurso recursoActualizado) {
        try {
            Recurso recurso = recursoRepository.findById(id).orElseThrow();
            recurso.setNombre(recursoActualizado.getNombre());
            return ResponseEntity.ok(recursoRepository.save(recurso));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al actualizar recurso");
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            recursoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al eliminar recurso");
        }
    }
}
