package com.pi.backend.repository;

import com.pi.backend.model.ProfesorRol;
import com.pi.backend.model.ProfesorRolId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfesorRolRepository extends JpaRepository<ProfesorRol, ProfesorRolId> {
}
