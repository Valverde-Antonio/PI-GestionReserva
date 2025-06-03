package com.pi.backend.controller;

import com.pi.backend.model.Espacio;
import com.pi.backend.repository.EspacioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/espacios")
@CrossOrigin(origins = "*")
public class EspacioController {

    @Autowired
    private EspacioRepository espacioRepository;

    @GetMapping
    public List<Espacio> listar() {
        return espacioRepository.findAll();
    }

    @PostMapping
    public Espacio crear(@RequestBody Espacio espacio) {
        return espacioRepository.save(espacio);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        espacioRepository.deleteById(id);
    }
}
