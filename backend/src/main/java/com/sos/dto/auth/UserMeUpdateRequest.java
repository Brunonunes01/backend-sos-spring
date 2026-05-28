package com.sos.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserMeUpdateRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'-]+$", message = "Nome deve conter letras e não pode ter caracteres inválidos")
        String nome,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,}$", message = "E-mail deve conter domínio válido")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
        String email,

        @Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
        String novaSenha
) {
}
