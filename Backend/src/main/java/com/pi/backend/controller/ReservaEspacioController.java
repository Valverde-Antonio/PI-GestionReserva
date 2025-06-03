package com.pi.backend.controller;

import com.pi.backend.model.ReservaEspacio;
import com.pi.backend.repository.ReservaEspacioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas-espacios")
@CrossOrigin(origins = "*")
public class ReservaEspacioController {

    @Autowired
    private ReservaEspacioRepository reservaRepository;

    @GetMapping
    public List<ReservaEspacio> listar() {
        return reservaRepository.findAll();
    }

    @PostMapping
    public ReservaEspacio crear(@RequestBody ReservaEspacio reserva) {
        return reservaRepository.save(reserva);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        reservaRepository.deleteById(id);
    }
}
