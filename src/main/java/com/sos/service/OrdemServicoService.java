package com.sos.service;

import com.sos.dto.ordem.ItemOrdemServicoRequest;
import com.sos.dto.ordem.ItemOrdemServicoResponse;
import com.sos.dto.ordem.OrdemServicoRequest;
import com.sos.dto.ordem.OrdemServicoResponse;
import com.sos.exception.InvalidStatusTransitionException;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.Cliente;
import com.sos.model.ItemOrdemServico;
import com.sos.model.OrdemServico;
import com.sos.model.Servico;
import com.sos.model.StatusOS;
import com.sos.model.Usuario;
import com.sos.repository.ClienteRepository;
import com.sos.repository.OrdemServicoRepository;
import com.sos.repository.ServicoRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrdemServicoService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioService usuarioService;

    public OrdemServicoService(OrdemServicoRepository ordemServicoRepository,
                               ClienteRepository clienteRepository,
                               ServicoRepository servicoRepository,
                               UsuarioService usuarioService) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public Page<OrdemServicoResponse> listar(StatusOS status, Long clienteId, LocalDate dataInicial, LocalDate dataFinal, Pageable pageable) {
        Specification<OrdemServico> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (clienteId != null) {
                predicates.add(cb.equal(root.get("cliente").get("id"), clienteId));
            }
            if (dataInicial != null && dataFinal != null) {
                predicates.add(cb.between(root.get("dataAbertura"),
                        dataInicial.atStartOfDay(),
                        dataFinal.atTime(23, 59, 59)));
            } else if (dataInicial != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataAbertura"), dataInicial.atStartOfDay()));
            } else if (dataFinal != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataAbertura"), dataFinal.atTime(23, 59, 59)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return ordemServicoRepository.findAll(specification, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrdemServicoResponse buscarPorId(Long id) {
        OrdemServico ordemServico = buscarOrdem(id);
        return toResponse(ordemServico);
    }

    @Transactional
    public OrdemServicoResponse criar(OrdemServicoRequest request) {
        Cliente cliente = clienteRepository.findByIdAndAtivoTrue(request.clienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente com id " + request.clienteId() + " não encontrado"));
        Usuario usuarioAbertura = usuarioService.usuarioLogado();

        OrdemServico ordemServico = new OrdemServico();
        ordemServico.setCliente(cliente);
        ordemServico.setTipo(request.tipo());
        ordemServico.setPrioridade(request.prioridade());
        ordemServico.setDescricaoProblema(request.descricaoProblema());
        ordemServico.setObservacoes(request.observacoes());
        ordemServico.setStatus(StatusOS.ABERTA);
        ordemServico.setUsuarioAbertura(usuarioAbertura);

        preencherItens(request.itens(), ordemServico);
        ordemServico.recalcularValorTotal();

        return toResponse(ordemServicoRepository.save(ordemServico));
    }

    @Transactional
    public OrdemServicoResponse atualizar(Long id, OrdemServicoRequest request) {
        OrdemServico ordemServico = buscarOrdem(id);
        Cliente cliente = clienteRepository.findByIdAndAtivoTrue(request.clienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente com id " + request.clienteId() + " não encontrado"));

        ordemServico.setCliente(cliente);
        ordemServico.setTipo(request.tipo());
        ordemServico.setPrioridade(request.prioridade());
        ordemServico.setDescricaoProblema(request.descricaoProblema());
        ordemServico.setObservacoes(request.observacoes());
        ordemServico.limparItens();
        preencherItens(request.itens(), ordemServico);
        ordemServico.recalcularValorTotal();

        return toResponse(ordemServicoRepository.save(ordemServico));
    }

    @Transactional
    public OrdemServicoResponse atualizarStatus(Long id, StatusOS novoStatus) {
        OrdemServico ordemServico = buscarOrdem(id);
        validarTransicaoStatus(ordemServico.getStatus(), novoStatus);
        ordemServico.setStatus(novoStatus);
        if (novoStatus == StatusOS.CONCLUIDA) {
            ordemServico.setDataConclusao(LocalDateTime.now());
            ordemServico.setUsuarioFechamento(usuarioService.usuarioLogado());
        }
        if (novoStatus == StatusOS.CANCELADA) {
            ordemServico.setUsuarioFechamento(usuarioService.usuarioLogado());
        }
        return toResponse(ordemServicoRepository.save(ordemServico));
    }

    @Transactional
    public void cancelar(Long id) {
        atualizarStatus(id, StatusOS.CANCELADA);
    }

    public OrdemServicoResponse toResponse(OrdemServico ordemServico) {
        return new OrdemServicoResponse(
                ordemServico.getId(),
                ordemServico.getCliente().getId(),
                ordemServico.getCliente().getNome(),
                ordemServico.getDataAbertura(),
                ordemServico.getDataConclusao(),
                ordemServico.getTipo(),
                ordemServico.getStatus(),
                ordemServico.getUsuarioAbertura().getId(),
                ordemServico.getUsuarioAbertura().getNome(),
                ordemServico.getUsuarioFechamento() != null ? ordemServico.getUsuarioFechamento().getId() : null,
                ordemServico.getUsuarioFechamento() != null ? ordemServico.getUsuarioFechamento().getNome() : null,
                ordemServico.getPrioridade(),
                ordemServico.getDescricaoProblema(),
                ordemServico.getObservacoes(),
                ordemServico.getValorTotal(),
                ordemServico.getCriadoEm(),
                ordemServico.getAtualizadoEm(),
                ordemServico.getItens().stream().map(item -> new ItemOrdemServicoResponse(
                        item.getId(),
                        item.getServico().getId(),
                        item.getServico().getNome(),
                        item.getQuantidade(),
                        item.getPrecoUnitario(),
                        item.getSubtotal()
                )).toList()
        );
    }

    private OrdemServico buscarOrdem(Long id) {
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de serviço com id " + id + " não encontrada"));
    }

    private void validarTransicaoStatus(StatusOS atual, StatusOS novo) {
        if (atual == novo) {
            return;
        }
        if (novo == StatusOS.CANCELADA) {
            return;
        }
        if (atual == StatusOS.ABERTA && novo == StatusOS.EM_ANDAMENTO) {
            return;
        }
        if (atual == StatusOS.EM_ANDAMENTO && novo == StatusOS.CONCLUIDA) {
            return;
        }
        throw new InvalidStatusTransitionException("Não é permitido mudar status de " + atual + " para " + novo);
    }

    private void preencherItens(List<ItemOrdemServicoRequest> itensRequest, OrdemServico ordemServico) {
        for (ItemOrdemServicoRequest itemRequest : itensRequest) {
            Servico servico = servicoRepository.findByIdAndAtivoTrue(itemRequest.servicoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Serviço com id " + itemRequest.servicoId() + " não encontrado"));
            ItemOrdemServico item = new ItemOrdemServico();
            item.setServico(servico);
            item.setQuantidade(itemRequest.quantidade());
            BigDecimal preco = itemRequest.precoUnitario() != null ? itemRequest.precoUnitario() : servico.getPrecoBase();
            item.setPrecoUnitario(preco);
            item.calcularSubtotal();
            ordemServico.adicionarItem(item);
        }
    }
}
