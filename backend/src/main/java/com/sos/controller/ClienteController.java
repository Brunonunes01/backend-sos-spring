package com.sos.controller;

import com.sos.dto.cliente.ClienteRequest;
import com.sos.dto.cliente.ClienteResponse;
import com.sos.dto.ordem.OrdemServicoResponse;
import com.sos.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes")
@Tag(name = "Clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    @Operation(summary = "Listar clientes")
    public ResponseEntity<Page<ClienteResponse>> listar(
            @RequestParam(required = false) String nome,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(clienteService.listar(nome, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar cliente por ID")
    public ResponseEntity<ClienteResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar cliente")
    public ResponseEntity<ClienteResponse> criar(@Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.criar(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cliente")
    public ResponseEntity<ClienteResponse> atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.ok(clienteService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desativar cliente")
    public void desativar(@PathVariable Long id) {
        clienteService.desativar(id);
    }

    @GetMapping("/{id}/ordens")
    @Operation(summary = "Listar ordens de serviço do cliente")
    public ResponseEntity<Page<OrdemServicoResponse>> listarOrdens(
            @PathVariable Long id,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(clienteService.listarOrdens(id, pageable));
    }
}
