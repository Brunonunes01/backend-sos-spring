package com.sos.dto.auth;

import com.sos.model.PerfilUsuario;

public record UserMeResponse(
        Long id,
        String nome,
        String email,
        PerfilUsuario perfil
) {
}
