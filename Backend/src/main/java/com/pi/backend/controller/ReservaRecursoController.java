package com.pi.backend.controller;

import com.pi.backend.model.ReservaRecurso;
import com.pi.backend.repository.ReservaRecursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas-recursos")
@CrossOrigin(origins = "*")
public class ReservaRecursoController {

    @Autowired
    private ReservaRecursoRepository reservaRepository;

    @GetMapping
    public List<ReservaRecurso> listar() {
        return reservaRepository.findAll();
    }

    @PostMapping
    public ReservaRecurso crear(@RequestBody ReservaRecurso reserva) {
        return reservaRepository.save(reserva);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        reservaRepository.deleteById(id);
    }
}
