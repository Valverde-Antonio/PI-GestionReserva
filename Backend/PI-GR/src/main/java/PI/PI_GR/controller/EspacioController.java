package com.gestionreserva.controller;

import com.gestionreserva.model.Espacio;
import com.gestionreserva.repository.EspacioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/espacios")
@CrossOrigin(origins = "*")
public class EspacioController {

    private final EspacioRepository repository;

    public EspacioController(EspacioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Espacio> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Espacio create(@RequestBody Espacio obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}