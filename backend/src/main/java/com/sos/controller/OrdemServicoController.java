package com.sos.controller;

import com.sos.dto.ordem.OrdemServicoRequest;
import com.sos.dto.ordem.OrdemServicoResponse;
import com.sos.dto.ordem.OrdemStatusUpdateRequest;
import com.sos.model.StatusOS;
import com.sos.model.TipoOS;
import com.sos.service.OrdemServicoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ordens")
@Tag(name = "Ordens de Serviço")
public class OrdemServicoController {

    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(OrdemServicoService ordemServicoService) {
        this.ordemServicoService = ordemServicoService;
    }

    @GetMapping
    @Operation(summary = "Listar ordens")
    public ResponseEntity<Page<OrdemServicoResponse>> listar(
            @RequestParam(required = false) StatusOS status,
            @RequestParam(required = false) TipoOS tipo,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(ordemServicoService.listar(status, tipo, clienteId, dataInicial, dataFinal, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar ordem por ID")
    public ResponseEntity<OrdemServicoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ordemServicoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar ordem de serviço")
    public ResponseEntity<OrdemServicoResponse> criar(@Valid @RequestBody OrdemServicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordemServicoService.criar(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar ordem de serviço")
    public ResponseEntity<OrdemServicoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody OrdemServicoRequest request) {
        return ResponseEntity.ok(ordemServicoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Alterar status da ordem de serviço")
    public ResponseEntity<OrdemServicoResponse> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrdemStatusUpdateRequest request) {
        return ResponseEntity.ok(ordemServicoService.atualizarStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cancelar ordem de serviço")
    public void cancelar(@PathVariable Long id) {
        ordemServicoService.cancelar(id);
    }
}
