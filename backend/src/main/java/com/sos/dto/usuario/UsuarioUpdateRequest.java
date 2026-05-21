package com.sos.dto.usuario;

import com.sos.model.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(min = 6, max = 100) String senha,
        @NotNull PerfilUsuario perfil
) {
}
