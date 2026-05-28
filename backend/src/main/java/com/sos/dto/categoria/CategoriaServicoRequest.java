package com.sos.dto.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoriaServicoRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'-]+$", message = "Nome deve conter letras e não pode ter caracteres inválidos")
        String nome,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 3, max = 500, message = "Descrição deve ter entre 3 e 500 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ0-9])[A-Za-zÀ-ÿ0-9 .,'\\-/º°]+$", message = "Descrição contém caracteres inválidos")
        String descricao
) {
}
