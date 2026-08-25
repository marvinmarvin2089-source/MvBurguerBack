# DevBurger API

Backend REST de uma hamburgueria digital, desenvolvido para demonstrar um fluxo completo de e-commerce: autenticação, catálogo, carrinho, pedidos, painel administrativo e pagamentos online.

## Destaques técnicos

- Cadastro e login de usuários com senha criptografada usando bcrypt.
- Autenticação baseada em JWT.
- Perfis administrativos para gerenciar produtos e categorias.
- Upload e disponibilização de imagens.
- Produtos relacionados a categorias e indicação de oferta.
- Criação e consulta de pedidos.
- Atualização do status de pedidos por administradores.
- Criação de Payment Intents no Stripe com o valor calculado a partir do banco de dados.
- Webhook do Stripe para atualização do status de pagamentos.
- Validação de dados de entrada com Yup.

### Fluxo de pagamento

1. O backend calcula o valor do pedido usando os preços persistidos no PostgreSQL.
2. O Stripe Payment Intent é criado em modo de teste.
3. O frontend confirma o pagamento com Stripe Elements.
4. O Stripe CLI encaminha os eventos para o webhook local.
5. O webhook valida a assinatura e atualiza o pedido para `Pagamento aprovado` ou `Pagamento falhou`.

## Stack

Node.js · Express · Sequelize · PostgreSQL · JWT · bcrypt · Multer · Stripe

## Requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- Uma conta Stripe para testar pagamentos

## Como executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um banco PostgreSQL.

3. Copie `.env.example` para `.env` e preencha os valores:

   ```bash
   cp .env.example .env
   ```

   No Windows, o arquivo também pode ser copiado manualmente.

   Gere valores próprios para `JWT_SECRET`, `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`. Nunca publique o arquivo `.env`.

4. Execute as migrations:

   ```bash
   npx sequelize-cli db:migrate
   ```

5. Inicie o servidor:

   ```bash
   npm run dev
   ```

Por padrão, a API estará disponível em `http://localhost:3001`.

### Executando com o frontend

Com o backend em execução, inicie o frontend em outro terminal. Por padrão, ele ficará disponível em `http://localhost:5173`.

O painel administrativo pode ser acessado em:

```text
http://localhost:5173/admin/produtos
http://localhost:5173/admin/pedidos
```

### Webhook local do Stripe

Para testar a confirmação automática localmente, instale o Stripe CLI, faça login e execute:

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

Copie o valor `whsec_...` exibido pelo comando para `STRIPE_WEBHOOK_SECRET` no `.env` e reinicie o backend.

Para testar um pagamento no modo de teste, use o cartão `4242 4242 4242 4242`, uma validade futura e qualquer CVC.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Executa a API em modo de desenvolvimento |
| `npm start` | Executa a API em modo de produção |
| `npm run check` | Verifica formatação e regras do Biome |
| `npm run format` | Formata os arquivos do projeto |
| `npx sequelize-cli db:migrate` | Executa as migrations |
| `npx sequelize-cli db:migrate:undo:all` | Reverte as migrations |

## Principais endpoints

Todas as rotas abaixo de `/users` e `/sessions` exigem o header:

```http
Authorization: Bearer SEU_TOKEN
```

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | Público | Cria usuário comum |
| `POST` | `/sessions` | Público | Autentica usuário e retorna JWT |
| `GET` | `/products` | Autenticado | Lista produtos |
| `POST` | `/products` | Administrador | Cria produto com imagem |
| `PUT` | `/products/:id` | Administrador | Atualiza produto |
| `GET` | `/categories` | Autenticado | Lista categorias |
| `POST` | `/categories` | Administrador | Cria categoria com imagem |
| `PUT` | `/categories/:id` | Administrador | Atualiza categoria |
| `POST` | `/orders` | Autenticado | Cria pedido |
| `GET` | `/orders` | Autenticado | Lista os próprios pedidos; administradores veem todos |
| `PUT` | `/orders/:id` | Administrador | Atualiza status do pedido |
| `POST` | `/create-payment-intent` | Autenticado | Inicia pagamento no Stripe |
| `GET` | `/payments/:paymentIntentId` | Autenticado | Consulta o status do próprio pagamento |
| `POST` | `/stripe/webhook` | Stripe | Recebe eventos assinados do Stripe |

As imagens são servidas por `/products-files/:filename` e `/category-files/:filename`.

## Segurança

- Segredos, credenciais do banco e chave do Stripe devem permanecer no `.env`.
- O endpoint público de cadastro não permite que o cliente se promova a administrador.
- O valor do pagamento é calculado com os preços armazenados no banco, e não com preços enviados pelo frontend.
- Pedidos comuns são isolados por usuário; apenas administradores podem alterar status e consultar todos os pedidos.
- Uploads aceitam somente imagens e têm limite de 5 MB.
- O webhook utiliza o corpo bruto da requisição para validar a assinatura enviada pelo Stripe.

## Estrutura

```text
src/
├── app/
│   ├── controllers/       # Regras das requisições
│   ├── middlewares/       # Autenticação e autorização
│   └── models/            # Modelos Sequelize
├── config/                # Banco, autenticação e uploads
├── database/migrations/   # Evolução do schema PostgreSQL
├── app.js                 # Configuração do Express
├── routes.js              # Rotas da API
└── server.js              # Inicialização do servidor
uploads/                   # Imagens enviadas localmente
```

## Próximas evoluções

- Adicionar testes automatizados de integração para autenticação, catálogo, pedidos e pagamentos.
- Criar documentação OpenAPI/Swagger.
- Adicionar paginação, filtros e ordenação ao catálogo e aos pedidos.
- Usar armazenamento de imagens dedicado em produção.
- Adicionar logs estruturados, rate limiting e tratamento centralizado de erros.

## Licença

Este projeto está disponível para fins de estudo e portfólio.
