# 🚀 Backend Rocket - Sistema de E-commerce

Uma API completa de e-commerce construída com NestJS, TypeScript e Prisma, oferecendo funcionalidades robustas de autenticação, carrinho de compras, gestão de produtos e histórico de pedidos.

## 🎯 Características Principais

- **🔐 Autenticação JWT** - Sistema seguro com roles (Admin/User)
- **🛍️ Carrinho Individual** - Cada usuário tem seu próprio carrinho
- **📦 Gestão de Produtos** - CRUD completo com controle de estoque
- **📋 Histórico de Pedidos** - Separado por usuário
- **🛡️ Controle de Acesso** - Rotas públicas, autenticadas e administrativas
- **📚 Documentação Swagger** - Interface interativa para testar a API

## 💻 Tecnologias

- **NestJS** - Framework Node.js para APIs escaláveis
- **TypeScript** - Tipagem estática para JavaScript
- **Prisma** - ORM moderno para banco de dados
- **SQLite** - Banco de dados leve e eficiente
- **JWT** - Autenticação segura com tokens
- **Swagger** - Documentação interativa da API
- **Bcrypt** - Criptografia de senhas

## 🚀 Como Rodar o Projeto

### 1. Clone e Instale
```bash
git clone https://github.com/odeni3/rocketlab-store-backend.git
cd backendrocket
npm install
```

### 2. Configure o Banco de Dados
```bash
npx prisma migrate dev
```

### 3. Inicie o Servidor
```bash
npm run start:dev
```

### 4. Acesse a Documentação
Abra seu navegador em: **http://localhost:3000/api**

## 🔑 Sistema de Autenticação

### Como Funciona
1. **Registro**: Crie uma conta com email e senha
2. **Login**: Receba um token JWT válido
3. **Uso**: Adicione o token gerado no login no header `Authorization: Bearer <token>` (cadeado no canto direito de cada rota)

### Roles de Usuário
- **USER**: Pode comprar, gerenciar carrinho e ver seus pedidos
- **ADMIN**: Pode gerenciar produtos e ver todos os pedidos\

### Exemplo de Uso

#### 1. Registrar Usuário
```bash
POST /auth/register
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "role": "USER"
}
```

#### 2. Fazer Login
```bash
POST /auth/login
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-joao",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "USER"
  }
}
```

#### 3. Usar Token nas Requisições
```bash
GET /cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛡️ Tipos de Endpoints

### 🌐 Públicos (sem autenticação)
- `GET /` - Status da API
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `GET /products` - Listar produtos
- `GET /products/category/{category}` - Produtos por categoria

### 👤 Autenticados (admin/user)
- `GET /auth/profile` - Perfil do usuário
- `GET /cart` - Obter carrinho
- `POST /cart/items` - Adicionar ao carrinho
- `PATCH /cart/items/{itemId}` - Atualizar quantidade
- `DELETE /cart/items/{itemId}` - Remover item
- `DELETE /cart/clear` - Limpar carrinho
- `POST /cart/checkout` - Finalizar compra
- `GET /orders/my-orders` - Meus pedidos
- `GET /orders/my-orders/{id}` - Meu pedido específico

### 👑 Administrativos (apenas admin)
- `POST /products` - Criar produto
- `GET /products/{id}` - Buscar produto por ID
- `PATCH /products/{id}` - Atualizar produto
- `DELETE /products/{id}` - Deletar produto
- `GET /auth/users` - Listar todos os usuários do sistema
- `GET /orders` - Todos os pedidos
- `GET /orders/user/{userId}` - Todos os pedidos de um usuário específico
- `GET /orders/{id}` - Qualquer pedido por ID

### Códigos de Erro Comuns
- **401 Unauthorized** - Token inválido ou ausente
- **403 Forbidden** - Sem permissão (ex: user tentando acessar admin)
- **404 Not Found** - Produto/pedido não encontrado
- **400 Bad Request** - Dados inválidos ou estoque insuficiente

> **🔒 Nota de Segurança:** A rota `/auth/users` retorna informações dos usuários **sem as senhas**, que são automaticamente removidas por segurança. Apenas administradores podem acessar essa informação.

### Prisma Studio
```bash
npx prisma studio
```
Interface visual para explorar o banco de dados.

## 📊 Cenários de Teste

### Cenário 1: Cliente Comum
1. Navega produtos sem login
2. Registra-se como USER
3. Adiciona produtos ao carrinho
4. Finaliza compra
5. Consulta histórico de pedidos

### Cenário 2: Administrador
1. Registra-se como ADMIN
2. Cria novos produtos
3. Gerencia estoque
4. Visualiza todos os usuários do sistema
5. Monitora todos os pedidos
6. Busca pedidos de usuários específicos
7. Acessa dados administrativos

## 🔧 Troubleshooting (Windows)

### Erro do Prisma "operation not permitted"
Se encontrar erro de permissão ao executar `npx prisma generate`:

```bash
# 1. Pare todos os processos Node.js
taskkill /F /IM node.exe

# 2. Limpe o cache do Prisma
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# 3. Regenere o client
npx prisma generate

# 4. Reinicie o servidor
npm run start:dev
```
