package com.sos.dto.ordem;

import java.math.BigDecimal;

public record ItemOrdemServicoResponse(
        Long id,
        Long servicoId,
        String servicoNome,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal
) {
}
