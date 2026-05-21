package com.sos.service;

import com.sos.dto.servico.ServicoRequest;
import com.sos.dto.servico.ServicoResponse;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.CategoriaServico;
import com.sos.model.Servico;
import com.sos.repository.ServicoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final CategoriaServicoService categoriaServicoService;

    public ServicoService(ServicoRepository servicoRepository, CategoriaServicoService categoriaServicoService) {
        this.servicoRepository = servicoRepository;
        this.categoriaServicoService = categoriaServicoService;
    }

    @Transactional(readOnly = true)
    public Page<ServicoResponse> listar(Long categoriaId, Pageable pageable) {
        if (categoriaId != null) {
            return servicoRepository.findByAtivoTrueAndCategoriaId(categoriaId, pageable).map(this::toResponse);
        }
        return servicoRepository.findByAtivoTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ServicoResponse buscarPorId(Long id) {
        return toResponse(buscarServicoAtivo(id));
    }

    @Transactional
    public ServicoResponse criar(ServicoRequest request) {
        CategoriaServico categoria = categoriaServicoService.buscarCategoriaAtiva(request.categoriaId());
        Servico servico = new Servico();
        aplicarDados(servico, request, categoria);
        servico.setAtivo(true);
        return toResponse(servicoRepository.save(servico));
    }

    @Transactional
    public ServicoResponse atualizar(Long id, ServicoRequest request) {
        Servico servico = buscarServicoAtivo(id);
        CategoriaServico categoria = categoriaServicoService.buscarCategoriaAtiva(request.categoriaId());
        aplicarDados(servico, request, categoria);
        return toResponse(servicoRepository.save(servico));
    }

    @Transactional
    public void desativar(Long id) {
        Servico servico = buscarServicoAtivo(id);
        servico.setAtivo(false);
        servicoRepository.save(servico);
    }

    @Transactional(readOnly = true)
    public Servico buscarServicoAtivo(Long id) {
        return servicoRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço com id " + id + " não encontrado"));
    }

    private void aplicarDados(Servico servico, ServicoRequest request, CategoriaServico categoria) {
        servico.setNome(request.nome());
        servico.setDescricao(request.descricao());
        servico.setPrecoBase(request.precoBase());
        servico.setCategoria(categoria);
    }

    private ServicoResponse toResponse(Servico servico) {
        return new ServicoResponse(
                servico.getId(),
                servico.getNome(),
                servico.getDescricao(),
                servico.getPrecoBase(),
                servico.getCategoria().getId(),
                servico.getCategoria().getNome(),
                servico.getAtivo(),
                servico.getDataCadastro(),
                servico.getDataEntrega()
        );
    }
}
