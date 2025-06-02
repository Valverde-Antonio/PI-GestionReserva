package com.gestionreserva.controller;

import com.gestionreserva.model.Profesor;
import com.gestionreserva.repository.ProfesorRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesors")
@CrossOrigin(origins = "*")
public class ProfesorController {

    private final ProfesorRepository repository;

    public ProfesorController(ProfesorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Profesor> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Profesor create(@RequestBody Profesor obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}