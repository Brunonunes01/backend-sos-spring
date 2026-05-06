CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    cep VARCHAR(10),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias_servico (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS servicos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(500),
    preco_base NUMERIC(10,2) NOT NULL,
    categoria_id BIGINT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega TIMESTAMP,
    CONSTRAINT fk_servico_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_servico(id)
);

CREATE TABLE IF NOT EXISTS ordens_servico (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    data_abertura TIMESTAMP NOT NULL,
    data_conclusao TIMESTAMP,
    tipo VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    usuario_abertura BIGINT NOT NULL,
    usuario_fechamento BIGINT,
    prioridade VARCHAR(20) NOT NULL,
    descricao_problema VARCHAR(2000),
    observacoes VARCHAR(1000),
    valor_total NUMERIC(10,2),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    CONSTRAINT fk_ordem_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_ordem_usuario_abertura FOREIGN KEY (usuario_abertura) REFERENCES usuarios(id),
    CONSTRAINT fk_ordem_usuario_fechamento FOREIGN KEY (usuario_fechamento) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_ordem_servico (
    id BIGSERIAL PRIMARY KEY,
    ordem_servico_id BIGINT NOT NULL,
    servico_id BIGINT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade >= 1),
    preco_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_item_ordem FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_servico FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria_id ON servicos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ordens_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_status ON ordens_servico(status);
