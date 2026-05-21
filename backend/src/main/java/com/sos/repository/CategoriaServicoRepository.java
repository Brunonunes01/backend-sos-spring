package com.sos.repository;

import com.sos.model.CategoriaServico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaServicoRepository extends JpaRepository<CategoriaServico, Long> {
    Optional<CategoriaServico> findByIdAndAtivoTrue(Long id);

    Page<CategoriaServico> findByAtivoTrue(Pageable pageable);
}
