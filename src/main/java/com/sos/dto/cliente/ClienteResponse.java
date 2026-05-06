package com.sos.dto.cliente;

import java.time.LocalDateTime;

public record ClienteResponse(
        Long id,
        String nome,
        String cpfCnpj,
        String email,
        String telefone,
        String endereco,
        String cidade,
        String uf,
        String cep,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
}
