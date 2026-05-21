package com.sos.dto.servico;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ServicoRequest(
        @NotBlank @Size(max = 150) String nome,
        @Size(max = 500) String descricao,
        @NotNull @DecimalMin("0.00") BigDecimal precoBase,
        @NotNull Long categoriaId
) {
}
