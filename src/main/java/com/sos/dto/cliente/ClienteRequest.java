package com.sos.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Size(max = 18) String cpfCnpj,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 20) String telefone,
        @Size(max = 255) String endereco,
        @Size(max = 100) String cidade,
        @Size(max = 2) String uf,
        @Size(max = 10) String cep
) {
}
