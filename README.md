# SOS - Sistema de Ordem de Serviço

Projeto dividido em dois módulos:

- `backend/`: API REST em Spring Boot (Java 17 + PostgreSQL + Flyway + JWT).
- `sos-frontend/`: aplicação React (Vite) que consome a API.

## Como funciona

O frontend autentica na API e consome os endpoints em `/api/v1`.

Fluxo resumido:

1. Usuário faz login no frontend.
2. Backend valida credenciais e retorna token JWT.
3. Frontend envia o token nas próximas requisições.
4. Backend aplica regras de negócio e persiste dados no PostgreSQL.

## Requisitos

- Docker e Docker Compose plugin instalados
- (Opcional para rodar sem container) Java 17, Maven e Node 18+

## Rodar localmente sem container

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

API: `http://localhost:8081`
Swagger: `http://localhost:8081/swagger-ui.html`

### Frontend

```bash
cd sos-frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Gerar e rodar container (backend)

### 1) Subir PostgreSQL em container

```bash
docker network create sos-net

docker run -d \
  --name sos-postgres \
  --network sos-net \
  -e POSTGRES_DB=sos_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2) Gerar imagem do backend

```bash
docker build -t sos-backend:latest ./backend
```

### 3) Rodar container do backend

```bash
docker run -d \
  --name sos-backend \
  --network sos-net \
  -e DB_URL=jdbc:postgresql://sos-postgres:5432/sos_db \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=123456 \
  -e JWT_SECRET=sua_chave_super_secreta_com_no_minimo_32_caracteres \
  -e SERVER_PORT=8081 \
  -p 8081:8081 \
  sos-backend:latest
```

Teste rápido:

```bash
curl http://localhost:8081/api-docs
```

## Container do frontend (opcional)

### 1) Gerar imagem do frontend

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8081/api/v1 \
  -t sos-frontend:latest \
  ./sos-frontend
```

### 2) Rodar container do frontend

```bash
docker run -d \
  --name sos-frontend \
  -p 8080:80 \
  sos-frontend:latest
```

Acesse: `http://localhost:8080`

## Credenciais padrão

- Email: `admin@sos.com`
- Senha: `admin123`

## Comandos úteis

```bash
# Logs
docker logs -f sos-backend
docker logs -f sos-frontend
docker logs -f sos-postgres

# Parar containers
docker stop sos-frontend sos-backend sos-postgres

# Remover containers
docker rm sos-frontend sos-backend sos-postgres
```
