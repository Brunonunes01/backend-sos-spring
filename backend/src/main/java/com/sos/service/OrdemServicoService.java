package com.sos.service;

import com.sos.dto.ordem.ItemOrdemServicoRequest;
import com.sos.dto.ordem.ItemOrdemServicoResponse;
import com.sos.dto.ordem.OrdemServicoRequest;
import com.sos.dto.ordem.OrdemServicoResponse;
import com.sos.exception.InvalidStatusTransitionException;
import com.sos.exception.BusinessException;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.Cliente;
import com.sos.model.ItemOrdemServico;
import com.sos.model.OrdemServico;
import com.sos.model.StatusOS;
import com.sos.model.TipoItemOS;
import com.sos.model.TipoOS;
import com.sos.model.Usuario;
import com.sos.repository.ClienteRepository;
import com.sos.repository.OrdemServicoRepository;
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
    private final UsuarioService usuarioService;

    public OrdemServicoService(OrdemServicoRepository ordemServicoRepository,
                               ClienteRepository clienteRepository,
                               UsuarioService usuarioService) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public Page<OrdemServicoResponse> listar(StatusOS status, TipoOS tipo, Long clienteId, LocalDate dataInicial, LocalDate dataFinal, Pageable pageable) {
        Specification<OrdemServico> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
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
                        item.getTipoItem(),
                        item.getServico() != null ? item.getServico().getId() : null,
                        item.getServico() != null ? item.getServico().getNome() : null,
                        item.getDescricaoItem(),
                        item.getQuantidade(),
                        item.getPrecoUnitario(),
                        item.getSubtotal(),
                        item.getReferenciaLink(),
                        item.getReferenciaFonte()
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
            ItemOrdemServico item = new ItemOrdemServico();
            TipoItemOS tipoItem = itemRequest.tipoItem() != null ? itemRequest.tipoItem() : TipoItemOS.SERVICO;
            item.setTipoItem(tipoItem);
            item.setQuantidade(itemRequest.quantidade());

            BigDecimal preco;
            if (tipoItem == TipoItemOS.SERVICO) {
                throw new BusinessException("Itens aceitam apenas PRODUTO. Serviços não devem entrar no carrinho.");
            }
            if (itemRequest.descricaoItem() == null || itemRequest.descricaoItem().isBlank()) {
                throw new BusinessException("descricaoItem é obrigatória para itens do tipo PRODUTO");
            }
            if (itemRequest.precoUnitario() == null) {
                throw new BusinessException("precoUnitario é obrigatório para itens do tipo PRODUTO");
            }
            item.setDescricaoItem(itemRequest.descricaoItem().trim());
            item.setReferenciaLink(itemRequest.referenciaLink());
            item.setReferenciaFonte(itemRequest.referenciaFonte());
            preco = itemRequest.precoUnitario();

            item.setPrecoUnitario(preco);
            if (item.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("precoUnitario deve ser maior que zero");
            }
            item.calcularSubtotal();
            ordemServico.adicionarItem(item);
        }
    }
}
