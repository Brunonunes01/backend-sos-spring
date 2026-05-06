package com.sos.dto.ordem;

import com.sos.model.Prioridade;
import com.sos.model.StatusOS;
import com.sos.model.TipoOS;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrdemServicoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        LocalDateTime dataAbertura,
        LocalDateTime dataConclusao,
        TipoOS tipo,
        StatusOS status,
        Long usuarioAberturaId,
        String usuarioAberturaNome,
        Long usuarioFechamentoId,
        String usuarioFechamentoNome,
        Prioridade prioridade,
        String descricaoProblema,
        String observacoes,
        BigDecimal valorTotal,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        List<ItemOrdemServicoResponse> itens
) {
}
