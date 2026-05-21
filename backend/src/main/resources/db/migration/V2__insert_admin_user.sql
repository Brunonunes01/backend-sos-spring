CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (nome, email, senha, perfil, ativo)
VALUES ('Administrador', 'admin@sos.com', crypt('admin123', gen_salt('bf')), 'ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;
