package com.sos.dto.servico;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ServicoRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'-]+$", message = "Nome deve conter letras e não pode ter caracteres inválidos")
        String nome,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 3, max = 500, message = "Descrição deve ter entre 3 e 500 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ0-9])[A-Za-zÀ-ÿ0-9 .,'\\-/º°]+$", message = "Descrição contém caracteres inválidos")
        String descricao,

        @NotNull(message = "Preço base é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço base deve ser maior que zero")
        BigDecimal precoBase,

        @NotNull(message = "Categoria é obrigatória")
        Long categoriaId
) {
}
