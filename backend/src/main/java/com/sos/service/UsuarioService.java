package com.sos.service;

import com.sos.dto.auth.UserMeResponse;
import com.sos.dto.auth.UserMeUpdateRequest;
import com.sos.dto.usuario.UsuarioRequest;
import com.sos.dto.usuario.UsuarioResponse;
import com.sos.dto.usuario.UsuarioUpdateRequest;
import com.sos.exception.ConflictException;
import com.sos.exception.ResourceNotFoundException;
import com.sos.model.Usuario;
import com.sos.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(Pageable pageable) {
        return usuarioRepository.findByAtivoTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com id " + id + " não encontrado"));
        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("Já existe usuário com email " + request.email());
        }
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(request.perfil());
        usuario.setAtivo(true);
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com id " + id + " não encontrado"));

        if (usuarioRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ConflictException("Já existe usuário com email " + request.email());
        }

        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setPerfil(request.perfil());
        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void desativar(Long id) {
        Usuario usuario = usuarioRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com id " + id + " não encontrado"));
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public UserMeResponse me() {
        Usuario usuario = usuarioLogado();
        return new UserMeResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }

    @Transactional
    public UserMeResponse atualizarContaLogada(UserMeUpdateRequest request) {
        Usuario usuario = usuarioLogado();
        String email = request.email().trim().toLowerCase();

        if (usuarioRepository.existsByEmailAndIdNot(email, usuario.getId())) {
            throw new ConflictException("Já existe usuário com email " + email);
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);

        if (request.novaSenha() != null && !request.novaSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return new UserMeResponse(salvo.getId(), salvo.getNome(), salvo.getEmail(), salvo.getPerfil());
    }

    @Transactional(readOnly = true)
    public Usuario usuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Usuário autenticado não encontrado");
        }
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não encontrado"));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getAtivo()
        );
    }
}
