package com.sos.dto.ordem;

import com.sos.model.TipoItemOS;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ItemOrdemServicoRequest(
        TipoItemOS tipoItem,
        Long servicoId,
        @Size(max = 255) String descricaoItem,
        @NotNull @Min(1) Integer quantidade,
        BigDecimal precoUnitario,
        @Size(max = 1000) String referenciaLink,
        @Size(max = 150) String referenciaFonte
) {
}
