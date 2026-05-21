package com.sos.controller;

import com.sos.dto.categoria.CategoriaServicoRequest;
import com.sos.dto.categoria.CategoriaServicoResponse;
import com.sos.service.CategoriaServicoService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categorias")
@Tag(name = "Categorias")
public class CategoriaServicoController {

    private final CategoriaServicoService categoriaServicoService;

    public CategoriaServicoController(CategoriaServicoService categoriaServicoService) {
        this.categoriaServicoService = categoriaServicoService;
    }

    @GetMapping
    @Operation(summary = "Listar categorias")
    public ResponseEntity<Page<CategoriaServicoResponse>> listar(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(categoriaServicoService.listar(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por ID")
    public ResponseEntity<CategoriaServicoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaServicoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar categoria")
    public ResponseEntity<CategoriaServicoResponse> criar(@Valid @RequestBody CategoriaServicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaServicoService.criar(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria")
    public ResponseEntity<CategoriaServicoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaServicoRequest request) {
        return ResponseEntity.ok(categoriaServicoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desativar categoria")
    public void desativar(@PathVariable Long id) {
        categoriaServicoService.desativar(id);
    }
}
