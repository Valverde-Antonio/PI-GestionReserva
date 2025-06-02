package com.gestionreserva.controller;

import com.gestionreserva.model.ProfesorRol;
import com.gestionreserva.repository.ProfesorRolRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesor-rols")
@CrossOrigin(origins = "*")
public class ProfesorRolController {

    private final ProfesorRolRepository repository;

    public ProfesorRolController(ProfesorRolRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ProfesorRol> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ProfesorRol create(@RequestBody ProfesorRol obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}