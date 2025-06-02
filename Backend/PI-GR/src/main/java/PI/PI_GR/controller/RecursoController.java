package com.gestionreserva.controller;

import com.gestionreserva.model.Recurso;
import com.gestionreserva.repository.RecursoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
@CrossOrigin(origins = "*")
public class RecursoController {

    private final RecursoRepository repository;

    public RecursoController(RecursoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Recurso> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Recurso create(@RequestBody Recurso obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}