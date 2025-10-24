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
    public List<Espacio> listarEspacios() {
        return espacioRepository.findAll();
    }
}
