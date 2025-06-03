package com.pi.backend.service;

import com.pi.backend.model.Rol;
import com.pi.backend.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;

    public Rol findByNombre(String nombre) {
        return rolRepository.findByNombre(nombre);
    }

    public Rol save(Rol rol) {
        return rolRepository.save(rol);
    }
}
