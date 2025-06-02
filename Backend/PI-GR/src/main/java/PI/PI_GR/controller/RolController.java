package com.gestionreserva.controller;

import com.gestionreserva.model.Rol;
import com.gestionreserva.repository.RolRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rols")
@CrossOrigin(origins = "*")
public class RolController {

    private final RolRepository repository;

    public RolController(RolRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Rol> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Rol create(@RequestBody Rol obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}