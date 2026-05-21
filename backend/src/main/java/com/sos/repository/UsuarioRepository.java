package com.sos.repository;

import com.sos.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Usuario> findByIdAndAtivoTrue(Long id);

    Page<Usuario> findByAtivoTrue(Pageable pageable);
}
