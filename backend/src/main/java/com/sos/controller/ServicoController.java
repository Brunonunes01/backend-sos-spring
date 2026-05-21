package com.sos.controller;

import com.sos.dto.servico.ServicoRequest;
import com.sos.dto.servico.ServicoResponse;
import com.sos.service.ServicoService;
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
@RequestMapping("/api/v1/servicos")
@Tag(name = "Serviços")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    @Operation(summary = "Listar serviços")
    public ResponseEntity<Page<ServicoResponse>> listar(
            @RequestParam(required = false) Long categoriaId,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(servicoService.listar(categoriaId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar serviço por ID")
    public ResponseEntity<ServicoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar serviço")
    public ResponseEntity<ServicoResponse> criar(@Valid @RequestBody ServicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicoService.criar(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar serviço")
    public ResponseEntity<ServicoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody ServicoRequest request) {
        return ResponseEntity.ok(servicoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desativar serviço")
    public void desativar(@PathVariable Long id) {
        servicoService.desativar(id);
    }
}
