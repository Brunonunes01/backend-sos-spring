package com.sos.dto.ordem;

import com.sos.model.TipoItemOS;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ItemOrdemServicoRequest(
        TipoItemOS tipoItem,
        Long servicoId,
        @Size(max = 255, message = "Descrição do item deve ter no máximo 255 caracteres")
        @Pattern(
                regexp = "^$|^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'\\-/º°]+$",
                message = "Descrição do item deve conter letras e não pode ter caracteres inválidos"
        )
        String descricaoItem,
        @NotNull(message = "Quantidade é obrigatória") @Min(value = 1, message = "Quantidade deve ser maior que zero") Integer quantidade,
        BigDecimal precoUnitario,
        @Size(max = 1000, message = "Link de referência deve ter no máximo 1000 caracteres") String referenciaLink,
        @Size(max = 150, message = "Fonte de referência deve ter no máximo 150 caracteres") String referenciaFonte
) {
}
