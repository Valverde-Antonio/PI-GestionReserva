package com.gestionreserva.controller;

import com.gestionreserva.model.ReservaRecurso;
import com.gestionreserva.repository.ReservaRecursoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reserva-recursos")
@CrossOrigin(origins = "*")
public class ReservaRecursoController {

    private final ReservaRecursoRepository repository;

    public ReservaRecursoController(ReservaRecursoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ReservaRecurso> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ReservaRecurso create(@RequestBody ReservaRecurso obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}