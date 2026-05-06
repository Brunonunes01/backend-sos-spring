INSERT INTO categorias_servico (nome, descricao, ativo)
VALUES ('Informática', 'Serviços de manutenção em computadores', TRUE),
       ('Elétrica', 'Serviços de manutenção elétrica', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO servicos (nome, descricao, preco_base, categoria_id, ativo, data_cadastro)
SELECT 'Formatação de Computador', 'Instalação limpa de sistema operacional', 180.00, c.id, TRUE, CURRENT_TIMESTAMP
FROM categorias_servico c
WHERE c.nome = 'Informática'
ON CONFLICT DO NOTHING;
