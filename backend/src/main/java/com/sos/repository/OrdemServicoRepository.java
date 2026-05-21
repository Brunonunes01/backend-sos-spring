package com.sos.repository;

import com.sos.model.OrdemServico;
import com.sos.model.StatusOS;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {
    Page<OrdemServico> findByClienteId(Long clienteId, Pageable pageable);

    Page<OrdemServico> findByStatus(StatusOS status, Pageable pageable);

    Page<OrdemServico> findByDataAberturaBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);
}
