package com.gestionreserva.controller;

import com.gestionreserva.model.ReservaEspacio;
import com.gestionreserva.repository.ReservaEspacioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reserva-espacios")
@CrossOrigin(origins = "*")
public class ReservaEspacioController {

    private final ReservaEspacioRepository repository;

    public ReservaEspacioController(ReservaEspacioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ReservaEspacio> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ReservaEspacio create(@RequestBody ReservaEspacio obj) {
        return repository.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}