package com.sos.repository;

import com.sos.model.Servico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServicoRepository extends JpaRepository<Servico, Long> {
    Optional<Servico> findByIdAndAtivoTrue(Long id);

    Page<Servico> findByAtivoTrue(Pageable pageable);

    Page<Servico> findByAtivoTrueAndCategoriaId(Long categoriaId, Pageable pageable);
}
