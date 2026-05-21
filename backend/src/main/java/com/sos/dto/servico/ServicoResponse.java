package com.sos.dto.servico;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServicoResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal precoBase,
        Long categoriaId,
        String categoriaNome,
        Boolean ativo,
        LocalDateTime dataCadastro,
        LocalDateTime dataEntrega
) {
}
