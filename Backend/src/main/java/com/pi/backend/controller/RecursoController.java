package com.pi.backend.controller;

import com.pi.backend.model.Recurso;
import com.pi.backend.repository.RecursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
@CrossOrigin(origins = "*")
public class RecursoController {

    @Autowired
    private RecursoRepository recursoRepository;

    @GetMapping
    public List<Recurso> listar() {
        return recursoRepository.findAll();
    }

    @PostMapping
    public Recurso crear(@RequestBody Recurso recurso) {
        return recursoRepository.save(recurso);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        recursoRepository.deleteById(id);
    }
}
