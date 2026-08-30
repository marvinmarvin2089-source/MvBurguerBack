# 🍔 MV Burguer — API

![MV Burguer](docs/devburger-cover.png)

API REST do MV Burguer, uma aplicação de hamburgueria digital desenvolvida para demonstrar um fluxo completo de e-commerce: autenticação, catálogo, pedidos, gestão administrativa e pagamentos online.

O backend centraliza as regras de negócio, protege os recursos com JWT, calcula os valores dos pedidos a partir dos dados persistidos e integra o processamento de pagamentos com Stripe.

[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)

## 🚀 Funcionalidades

- Cadastro de usuários com senha protegida por hash usando bcryptjs.
- Login com emissão de token JWT.
- Autorização de operações administrativas por middleware.
- Catálogo público de produtos e categorias.
- Cadastro e edição administrativa de produtos e categorias.
- Upload de imagens com Multer, limite de 5 MB e filtro para arquivos de imagem.
- Criação de pedidos para usuários autenticados.
- Consulta dos próprios pedidos pelo cliente.
- Consulta de todos os pedidos pelo administrador.
- Atualização administrativa do andamento dos pedidos.
- Separação entre status do pedido e status do pagamento.
- Criação de PaymentIntents no Stripe.
- Validação de propriedade do PaymentIntent pelo usuário autenticado.
- Sincronização de pagamentos por Stripe Webhook.
- Serviço público de imagens de produtos e categorias.

## 🧠 Decisões técnicas

- Os preços são armazenados em centavos no banco para evitar problemas comuns de precisão com valores monetários.
- Ao criar um pagamento, o backend consulta os preços dos produtos no PostgreSQL em vez de confiar nos valores enviados pelo frontend.
- A taxa de entrega é calculada no servidor e adicionada ao valor do PaymentIntent.
- Cada PaymentIntent recebe o ID do usuário na metadata do Stripe.
- Antes de criar um pedido, o backend consulta o PaymentIntent e valida o usuário associado.
- O status representa o andamento operacional do pedido, enquanto payment_status representa a situação financeira.
- Usuário e produtos são armazenados como snapshots JSON no pedido, preservando os dados utilizados no momento da compra.
- Rotas administrativas são protegidas por authMiddleware e adminMiddleware.
- O CORS aceita somente o frontend configurado e o endereço local utilizado pelo Vite.

## 🛠 Tecnologias

- Node.js
- Express
- PostgreSQL
- Sequelize
- Sequelize CLI
- JSON Web Token (jsonwebtoken)
- bcryptjs
- Yup
- Multer
- Stripe
- CORS
- dotenv
- UUID
- Biome

## 🏗 Arquitetura

~~~text
src/
├── app/
│   ├── controllers/
│   │   ├── stripe/
│   │   └── ...
│   ├── middlewares/
│   └── models/
├── config/
├── database/
│   ├── index.js
│   └── migrations/
├── app.js
├── routes.js
└── server.js
uploads/
└── arquivos enviados pelos administradores
~~~

O projeto utiliza controllers para tratar as requisições, middlewares para autenticação e autorização, models Sequelize para acesso ao banco, configurações separadas e migrations para evolução do schema.

## 🔐 Autenticação e autorização

Após realizar login em POST /sessions, a API retorna um token JWT. As rotas protegidas devem receber:

~~~http
Authorization: Bearer SEU_TOKEN
~~~

### Níveis de acesso

- Público: cadastro, login e leitura do catálogo.
- Usuário autenticado: criação e consulta dos próprios pedidos e operações relacionadas ao próprio pagamento.
- Administrador: gerenciamento de produtos e categorias, consulta de todos os pedidos e atualização do status dos pedidos.

O usuário criado pelo endpoint público de cadastro não pode se promover a administrador, pois o controller força admin: false.

## 🌐 Endpoints

### Públicos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | /users | Cria um usuário comum |
| POST | /sessions | Autentica o usuário e retorna um JWT |
| GET | /products | Lista os produtos do catálogo |
| GET | /categories | Lista as categorias do catálogo |

### Autenticados

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | /orders | Cria um pedido após validar o pagamento |
| GET | /orders | Lista os pedidos do usuário; administradores veem todos |
| POST | /create-payment-intent | Cria um PaymentIntent no Stripe |
| GET | /payments/:paymentIntentId | Consulta um pagamento autorizado |

### Administrador

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | /products | Cria produto com imagem |
| PUT | /products/:id | Edita produto |
| POST | /categories | Cria categoria com imagem |
| PUT | /categories/:id | Edita categoria |
| PUT | /orders/:id | Atualiza o andamento do pedido |

### Stripe

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | /stripe/webhook | Recebe eventos assinados do Stripe |

## 📦 Status dos pedidos

O campo status representa o andamento da entrega:

~~~text
Pedido recebido → Em preparação → A caminho → Entregue
~~~

Também existe o estado separado:

~~~text
Cancelado
~~~

O status do pedido não é alterado pelo webhook de pagamento.

## 💳 Status de pagamento

O campo payment_status representa a situação do pagamento:

| Status | Significado |
| --- | --- |
| Pendente | Pagamento ainda não confirmado ou em processamento |
| Aprovado | Pagamento confirmado pelo Stripe |
| Falhou | Pagamento recusado ou não concluído |

Esses estados são independentes do andamento operacional do pedido. Um pedido pode estar Pedido recebido enquanto seu pagamento ainda está Pendente, por exemplo.

## 💳 Fluxo de pagamento Stripe

~~~text
Carrinho
  ↓
Backend consulta produtos e calcula o valor
  ↓
PaymentIntent criado no Stripe
  ↓
Frontend confirma o pagamento
  ↓
Backend valida o PaymentIntent e o usuário
  ↓
Pedido criado com status e payment_status
  ↓
Stripe Webhook sincroniza payment_status
~~~

O valor do PaymentIntent é calculado no backend usando os preços armazenados no banco e uma taxa de entrega fixa de 500 centavos.

A integração pode ser utilizada em modo de teste para desenvolvimento e demonstração. Chaves e segredos nunca devem ser publicados no repositório.

## 🖼 Upload e serviço de imagens

O Multer salva os arquivos localmente na pasta uploads/.

Regras atuais:

- Apenas arquivos com MIME type de imagem são aceitos.
- O tamanho máximo é de 5 MB.
- O nome do arquivo recebe um UUID para reduzir colisões.

As imagens são servidas publicamente pelos caminhos:

~~~text
/products-files/:filename
/category-files/:filename
~~~

O campo virtual url dos models utiliza APP_URL para montar a URL completa. Em produção, APP_URL deve apontar para a URL pública do backend.

## ⚙️ Variáveis de ambiente

Crie um arquivo .env com base em .env.example e preencha os valores localmente. Os nomes utilizados pelo código são:

~~~env
PORT=
APP_URL=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=
FRONTEND_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
~~~

Nunca versione o arquivo .env. As chaves do Stripe, o segredo JWT e as credenciais do PostgreSQL devem ser configurados somente no ambiente de execução.

## 💻 Executando localmente

### Pré-requisitos

- Node.js.
- PostgreSQL.
- Uma conta Stripe para testes, caso o fluxo de pagamento seja utilizado.

### Instalação

~~~bash
git clone https://github.com/marvinmarvin2089-source/MvBurguerBack.git
cd MvBurguerBack
npm install
~~~

Crie um banco PostgreSQL e configure o .env com os dados da conexão, JWT, Stripe e URLs da aplicação.

Execute as migrations:

~~~bash
npm run migrate
~~~

Inicie a API em desenvolvimento:

~~~bash
npm run dev
~~~

Por padrão, o servidor utiliza a porta 3001.

## 🔔 Webhook local do Stripe

O Stripe CLI é uma ferramenta opcional para desenvolvimento local e não é uma dependência npm do projeto.

Depois de instalar e autenticar o Stripe CLI, encaminhe os eventos para a API:

~~~bash
stripe listen --forward-to localhost:3001/stripe/webhook
~~~

Use o segredo whsec_... fornecido pelo CLI apenas no .env local, na variável STRIPE_WEBHOOK_SECRET.

Para pagamentos de teste, utilize os cartões de teste disponibilizados na documentação do Stripe, como 4242 4242 4242 4242, com validade futura e CVC de teste.

## 📜 Scripts

| Comando | Descrição |
| --- | --- |
| npm run dev | Inicia a API com reinicialização automática |
| npm start | Inicia a API normalmente |
| npm run migrate | Executa as migrations do Sequelize |
| npm run check | Verifica o código com Biome |
| npm run format | Formata os arquivos de src e modifica o código |

## 🌍 Deploy

O backend está publicado no Render e o frontend correspondente está publicado separadamente na Vercel.

- API: [mvburguerback.onrender.com](https://mvburguerback.onrender.com)
- Aplicação: [mv-burguer-backend-front.vercel.app](https://mv-burguer-backend-front.vercel.app)

Instâncias gratuitas do Render podem apresentar cold start após um período de inatividade.

## 🔗 Frontend

- Aplicação publicada: [mv-burguer-backend-front.vercel.app](https://mv-burguer-backend-front.vercel.app)
- Repositório: [mv-burguer-backend-front](https://github.com/marvinmarvin2089-source/mv-burguer-backend-front)

## 🔒 Segurança implementada

- Senhas protegidas por hash com bcryptjs.
- Autenticação com JWT.
- Autorização administrativa por middleware.
- Segredos mantidos em variáveis de ambiente.
- Validação da assinatura do Stripe Webhook.
- CORS restrito ao frontend configurado e ao ambiente local.
- Cálculo dos valores de pagamento no backend.
- Validação da propriedade do PaymentIntent pelo usuário autenticado.
- Usuários comuns limitados aos próprios pedidos.

## 🔮 Melhorias futuras

- Adicionar testes automatizados unitários e de integração.
- Otimizar a consulta de pedidos para filtrar diretamente no banco.
- Adicionar documentação OpenAPI/Swagger.
- Usar armazenamento externo para imagens, como Cloudinary ou S3.
- Implementar tratamento global e padronizado de erros.
- Automatizar a limpeza de arquivos antigos.
- Adicionar logs estruturados e observabilidade.

## 👨‍💻 Autor

**Marcus Vinícius**

- GitHub: [marvinmarvin2089-source](https://github.com/marvinmarvin2089-source)

## 📄 Licença

Este projeto está disponível para fins de estudo e portfólio.
