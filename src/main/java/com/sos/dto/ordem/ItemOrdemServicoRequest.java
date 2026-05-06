package com.sos.dto.ordem;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ItemOrdemServicoRequest(
        @NotNull Long servicoId,
        @NotNull @Min(1) Integer quantidade,
        BigDecimal precoUnitario
) {
}
