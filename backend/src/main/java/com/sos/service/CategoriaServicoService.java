package com.sos.service;

import com.sos.dto.categoria.CategoriaServicoRequest;
import com.sos.dto.categoria.CategoriaServicoResponse;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.CategoriaServico;
import com.sos.repository.CategoriaServicoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaServicoService {

    private final CategoriaServicoRepository categoriaServicoRepository;

    public CategoriaServicoService(CategoriaServicoRepository categoriaServicoRepository) {
        this.categoriaServicoRepository = categoriaServicoRepository;
    }

    @Transactional(readOnly = true)
    public Page<CategoriaServicoResponse> listar(Pageable pageable) {
        return categoriaServicoRepository.findByAtivoTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoriaServicoResponse buscarPorId(Long id) {
        return toResponse(buscarCategoriaAtiva(id));
    }

    @Transactional
    public CategoriaServicoResponse criar(CategoriaServicoRequest request) {
        CategoriaServico categoria = new CategoriaServico();
        categoria.setNome(normalizarTexto(request.nome()));
        categoria.setDescricao(normalizarTexto(request.descricao()));
        categoria.setAtivo(true);
        return toResponse(categoriaServicoRepository.save(categoria));
    }

    @Transactional
    public CategoriaServicoResponse atualizar(Long id, CategoriaServicoRequest request) {
        CategoriaServico categoria = buscarCategoriaAtiva(id);
        categoria.setNome(normalizarTexto(request.nome()));
        categoria.setDescricao(normalizarTexto(request.descricao()));
        return toResponse(categoriaServicoRepository.save(categoria));
    }

    @Transactional
    public void desativar(Long id) {
        CategoriaServico categoria = buscarCategoriaAtiva(id);
        categoria.setAtivo(false);
        categoriaServicoRepository.save(categoria);
    }

    @Transactional(readOnly = true)
    public CategoriaServico buscarCategoriaAtiva(Long id) {
        return categoriaServicoRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria com id " + id + " não encontrada"));
    }

    private String normalizarTexto(String valor) {
        return valor != null ? valor.trim() : null;
    }

    private CategoriaServicoResponse toResponse(CategoriaServico categoria) {
        return new CategoriaServicoResponse(
                categoria.getId(),
                categoria.getNome(),
                categoria.getDescricao(),
                categoria.getAtivo()
        );
    }
}
