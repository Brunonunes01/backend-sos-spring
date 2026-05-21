package com.sos.repository;

import com.sos.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByCpfCnpj(String cpfCnpj);

    boolean existsByCpfCnpjAndIdNot(String cpfCnpj, Long id);

    Optional<Cliente> findByIdAndAtivoTrue(Long id);

    Page<Cliente> findByAtivoTrueAndNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Cliente> findByAtivoTrue(Pageable pageable);
}
