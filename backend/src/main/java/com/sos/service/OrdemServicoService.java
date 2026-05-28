package com.sos.service;

import com.sos.dto.ordem.ItemOrdemServicoRequest;
import com.sos.dto.ordem.ItemOrdemServicoResponse;
import com.sos.dto.ordem.OrdemServicoRequest;
import com.sos.dto.ordem.OrdemServicoResponse;
import com.sos.exception.BusinessException;
import com.sos.exception.InvalidStatusTransitionException;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.Cliente;
import com.sos.model.ItemOrdemServico;
import com.sos.model.OrdemServico;
import com.sos.model.Servico;
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
import java.util.regex.Pattern;

@Service
public class OrdemServicoService {

    private static final Pattern DESCRICAO_PRODUTO_PATTERN = Pattern.compile("^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'\\-/º°]+$");

    private final OrdemServicoRepository ordemServicoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioService usuarioService;
    private final ServicoService servicoService;

    public OrdemServicoService(OrdemServicoRepository ordemServicoRepository,
                               ClienteRepository clienteRepository,
                               UsuarioService usuarioService,
                               ServicoService servicoService) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioService = usuarioService;
        this.servicoService = servicoService;
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

        TipoOS tipoAtual = ordemServico.getTipo();
        boolean convertendoOrcamentoParaOrdem = tipoAtual == TipoOS.ORCAMENTO && request.tipo() == TipoOS.ORDEM_SERVICO;

        ordemServico.setCliente(cliente);
        ordemServico.setTipo(request.tipo());
        ordemServico.setPrioridade(request.prioridade());
        ordemServico.setDescricaoProblema(request.descricaoProblema());
        ordemServico.setObservacoes(request.observacoes());

        if (convertendoOrcamentoParaOrdem) {
            ordemServico.setStatus(StatusOS.ABERTA);
            ordemServico.setDataConclusao(null);
            ordemServico.setUsuarioFechamento(null);
        }

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

        if (atual == StatusOS.ABERTA && (novo == StatusOS.EM_ANDAMENTO || novo == StatusOS.CANCELADA)) {
            return;
        }

        if (atual == StatusOS.EM_ANDAMENTO && (novo == StatusOS.CONCLUIDA || novo == StatusOS.CANCELADA)) {
            return;
        }

        throw new InvalidStatusTransitionException("Não é permitido mudar status de " + atual + " para " + novo);
    }

    private void preencherItens(List<ItemOrdemServicoRequest> itensRequest, OrdemServico ordemServico) {
        if (itensRequest == null || itensRequest.isEmpty()) {
            throw new BusinessException("Informe ao menos um item no orçamento/ordem (serviço ou produto)");
        }

        for (ItemOrdemServicoRequest itemRequest : itensRequest) {
            ItemOrdemServico item = new ItemOrdemServico();
            TipoItemOS tipoItem = resolverTipoItem(itemRequest);
            item.setTipoItem(tipoItem);
            item.setQuantidade(itemRequest.quantidade());

            if (tipoItem == TipoItemOS.SERVICO) {
                preencherItemServico(item, itemRequest);
            } else {
                preencherItemProduto(item, itemRequest);
            }

            item.calcularSubtotal();
            ordemServico.adicionarItem(item);
        }
    }

    private TipoItemOS resolverTipoItem(ItemOrdemServicoRequest itemRequest) {
        if (itemRequest.tipoItem() != null) {
            return itemRequest.tipoItem();
        }
        if (itemRequest.servicoId() != null) {
            return TipoItemOS.SERVICO;
        }
        return TipoItemOS.PRODUTO;
    }

    private void preencherItemServico(ItemOrdemServico item, ItemOrdemServicoRequest itemRequest) {
        if (itemRequest.servicoId() == null) {
            throw new BusinessException("servicoId é obrigatório para itens do tipo SERVICO");
        }

        Servico servico = servicoService.buscarServicoAtivo(itemRequest.servicoId());
        item.setServico(servico);

        String descricao = itemRequest.descricaoItem() != null && !itemRequest.descricaoItem().isBlank()
                ? itemRequest.descricaoItem().trim()
                : servico.getNome();

        item.setDescricaoItem(descricao);
        item.setReferenciaLink(itemRequest.referenciaLink() != null ? itemRequest.referenciaLink().trim() : null);
        item.setReferenciaFonte(itemRequest.referenciaFonte() != null ? itemRequest.referenciaFonte().trim() : null);

        BigDecimal preco = itemRequest.precoUnitario() != null ? itemRequest.precoUnitario() : servico.getPrecoBase();
        if (preco == null || preco.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("precoUnitario deve ser maior que zero");
        }
        item.setPrecoUnitario(preco);
    }

    private void preencherItemProduto(ItemOrdemServico item, ItemOrdemServicoRequest itemRequest) {
        if (itemRequest.descricaoItem() == null || itemRequest.descricaoItem().isBlank()) {
            throw new BusinessException("descricaoItem é obrigatória para itens do tipo PRODUTO");
        }
        if (itemRequest.precoUnitario() == null) {
            throw new BusinessException("precoUnitario é obrigatório para itens do tipo PRODUTO");
        }

        String descricao = itemRequest.descricaoItem().trim();
        validarDescricaoProduto(descricao);

        item.setServico(null);
        item.setDescricaoItem(descricao);
        item.setReferenciaLink(itemRequest.referenciaLink() != null ? itemRequest.referenciaLink().trim() : null);
        item.setReferenciaFonte(itemRequest.referenciaFonte() != null ? itemRequest.referenciaFonte().trim() : null);
        item.setPrecoUnitario(itemRequest.precoUnitario());

        if (item.getPrecoUnitario().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("precoUnitario deve ser maior que zero");
        }
    }

    private void validarDescricaoProduto(String descricao) {
        if (!DESCRICAO_PRODUTO_PATTERN.matcher(descricao).matches()) {
            throw new BusinessException("descricaoItem deve conter letras e não pode ter caracteres inválidos");
        }
    }
}
