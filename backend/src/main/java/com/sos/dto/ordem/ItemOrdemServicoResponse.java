package com.sos.dto.ordem;

import com.sos.model.TipoItemOS;

import java.math.BigDecimal;

public record ItemOrdemServicoResponse(
        Long id,
        TipoItemOS tipoItem,
        Long servicoId,
        String servicoNome,
        String descricaoItem,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal,
        String referenciaLink,
        String referenciaFonte
) {
}
