package com.sos.dto.categoria;

public record CategoriaServicoResponse(
        Long id,
        String nome,
        String descricao,
        Boolean ativo
) {
}
