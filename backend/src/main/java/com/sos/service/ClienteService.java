package com.sos.service;

import com.sos.dto.cliente.ClienteRequest;
import com.sos.dto.cliente.ClienteResponse;
import com.sos.dto.ordem.OrdemServicoResponse;
import com.sos.exception.ConflictException;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.Cliente;
import com.sos.repository.ClienteRepository;
import com.sos.repository.OrdemServicoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final OrdemServicoService ordemServicoService;
    private final OrdemServicoRepository ordemServicoRepository;

    public ClienteService(ClienteRepository clienteRepository, OrdemServicoService ordemServicoService, OrdemServicoRepository ordemServicoRepository) {
        this.clienteRepository = clienteRepository;
        this.ordemServicoService = ordemServicoService;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listar(String nome, Pageable pageable) {
        if (nome != null && !nome.isBlank()) {
            return clienteRepository.findByAtivoTrueAndNomeContainingIgnoreCase(nome, pageable).map(this::toResponse);
        }
        return clienteRepository.findByAtivoTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(Long id) {
        Cliente cliente = buscarClienteAtivo(id);
        return toResponse(cliente);
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        ClienteRequest normalizado = normalizar(request);
        if (clienteRepository.existsByCpfCnpj(normalizado.cpfCnpj())) {
            throw new ConflictException("Já existe cliente com CPF/CNPJ " + normalizado.cpfCnpj());
        }
        Cliente cliente = new Cliente();
        aplicarDados(cliente, normalizado);
        cliente.setAtivo(true);
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscarClienteAtivo(id);
        ClienteRequest normalizado = normalizar(request);
        if (clienteRepository.existsByCpfCnpjAndIdNot(normalizado.cpfCnpj(), id)) {
            throw new ConflictException("Já existe cliente com CPF/CNPJ " + normalizado.cpfCnpj());
        }
        aplicarDados(cliente, normalizado);
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void desativar(Long id) {
        Cliente cliente = buscarClienteAtivo(id);
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public Page<OrdemServicoResponse> listarOrdens(Long clienteId, Pageable pageable) {
        buscarClienteAtivo(clienteId);
        return ordemServicoRepository.findByClienteId(clienteId, pageable).map(ordemServicoService::toResponse);
    }

    @Transactional(readOnly = true)
    public Cliente buscarClienteAtivo(Long id) {
        return clienteRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente com id " + id + " não encontrado"));
    }

    private ClienteRequest normalizar(ClienteRequest request) {
        return new ClienteRequest(
                normalizarTexto(request.nome()),
                somenteDigitos(request.cpfCnpj()),
                normalizarEmail(request.email()),
                somenteDigitos(request.telefone()),
                normalizarTexto(request.endereco()),
                normalizarTexto(request.cidade()),
                request.uf() != null ? request.uf().trim().toUpperCase() : null,
                somenteDigitos(request.cep())
        );
    }

    private String normalizarTexto(String valor) {
        return valor != null ? valor.trim() : null;
    }

    private String normalizarEmail(String valor) {
        return valor != null ? valor.trim().toLowerCase() : null;
    }

    private String somenteDigitos(String valor) {
        return valor != null ? valor.replaceAll("\\D", "") : null;
    }

    private void aplicarDados(Cliente cliente, ClienteRequest request) {
        cliente.setNome(request.nome());
        cliente.setCpfCnpj(request.cpfCnpj());
        cliente.setEmail(request.email());
        cliente.setTelefone(request.telefone());
        cliente.setEndereco(request.endereco());
        cliente.setCidade(request.cidade());
        cliente.setUf(request.uf());
        cliente.setCep(request.cep());
    }

    private ClienteResponse toResponse(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getCpfCnpj(),
                cliente.getEmail(),
                cliente.getTelefone(),
                cliente.getEndereco(),
                cliente.getCidade(),
                cliente.getUf(),
                cliente.getCep(),
                cliente.getAtivo(),
                cliente.getCriadoEm(),
                cliente.getAtualizadoEm()
        );
    }
}
