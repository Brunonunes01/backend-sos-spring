package com.sos.security;

import com.sos.model.Usuario;
import com.sos.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new UsernameNotFoundException("Usuário inativo: " + username);
        }

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name())))
                .build();
    }
}
