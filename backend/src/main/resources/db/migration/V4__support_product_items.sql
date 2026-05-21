ALTER TABLE itens_ordem_servico
    ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(20);

UPDATE itens_ordem_servico
SET tipo_item = 'SERVICO'
WHERE tipo_item IS NULL;

ALTER TABLE itens_ordem_servico
    ALTER COLUMN tipo_item SET NOT NULL;

ALTER TABLE itens_ordem_servico
    ALTER COLUMN servico_id DROP NOT NULL;

ALTER TABLE itens_ordem_servico
    ADD COLUMN IF NOT EXISTS descricao_item VARCHAR(255);

UPDATE itens_ordem_servico ios
SET descricao_item = s.nome
FROM servicos s
WHERE ios.servico_id = s.id
  AND ios.descricao_item IS NULL;

ALTER TABLE itens_ordem_servico
    ADD COLUMN IF NOT EXISTS referencia_link VARCHAR(1000);

ALTER TABLE itens_ordem_servico
    ADD COLUMN IF NOT EXISTS referencia_fonte VARCHAR(150);
