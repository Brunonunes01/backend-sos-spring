# SOS Frontend

Frontend React para o projeto SOS, integrado com a API Spring Boot.

## Requisitos

- Node.js 18+
- Backend rodando em `http://localhost:8081` (padrão do `application.yaml`)

## Configuração da API

Por padrão, o frontend usa:

`http://localhost:8081/api/v1`

Se precisar mudar, crie `sos-frontend/.env`:

```env
VITE_API_URL=http://localhost:8081/api/v1
```

## Executar

```bash
cd sos-frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Login de teste

- Email: `admin@sos.com`
- Senha: `admin123`
