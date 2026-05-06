package com.sos.dto.usuario;

import com.sos.model.PerfilUsuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        PerfilUsuario perfil,
        Boolean ativo
) {
}
