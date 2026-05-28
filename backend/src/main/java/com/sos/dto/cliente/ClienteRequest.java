package com.sos.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'-]+$", message = "Nome deve conter letras e não pode ter caracteres inválidos")
        String nome,

        @NotBlank(message = "CPF/CNPJ é obrigatório")
        @Pattern(
                regexp = "^(?:\\d{11}|\\d{14}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})$",
                message = "CPF/CNPJ deve conter 11 ou 14 dígitos"
        )
        String cpfCnpj,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,}$", message = "E-mail deve conter domínio válido (ex.: exemplo@dominio.com)")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
        String email,

        @NotBlank(message = "Telefone é obrigatório")
        @Pattern(
                regexp = "^(?:\\d{10,11}|\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4})$",
                message = "Telefone deve conter 10 ou 11 dígitos"
        )
        String telefone,

        @NotBlank(message = "Endereço é obrigatório")
        @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ0-9])[A-Za-zÀ-ÿ0-9 .,'\\-/º°]+$", message = "Endereço contém caracteres inválidos")
        String endereco,

        @NotBlank(message = "Cidade é obrigatória")
        @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ .'-]+$", message = "Cidade deve conter apenas letras")
        String cidade,

        @NotBlank(message = "UF é obrigatória")
        @Pattern(regexp = "^[A-Za-z]{2}$", message = "UF deve conter 2 letras")
        String uf,

        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "^(?:\\d{8}|\\d{5}-\\d{3})$", message = "CEP deve conter 8 dígitos")
        String cep
) {
}
