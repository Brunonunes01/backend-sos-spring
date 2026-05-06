package com.sos.dto.ordem;

import com.sos.model.Prioridade;
import com.sos.model.TipoOS;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrdemServicoRequest(
        @NotNull Long clienteId,
        @NotNull TipoOS tipo,
        @NotNull Prioridade prioridade,
        @Size(max = 2000) String descricaoProblema,
        @Size(max = 1000) String observacoes,
        @Valid @NotEmpty List<ItemOrdemServicoRequest> itens
) {
}
