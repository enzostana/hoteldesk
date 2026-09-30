# HotelDesk

Sistema acadêmico de gerenciamento de chamados de TI para hotel. Inclui autenticação, perfis de cliente/técnico/gerência, fluxo persistido de atendimento, comentários, solução e histórico.

## Funcionalidades

- Login com senha protegida por bcrypt e cookie de sessão assinado.
- Acesso validado no servidor por perfil: `CLIENT`, `TECHNICIAN` e `MANAGER`.
- Abertura, consulta, busca e filtros de chamados. Clientes entram diretamente na lista dos próprios chamados, sem dashboard.
- Atribuição ao técnico, atendimento, espera, comentário, solução e resolução.
- Encerramento permitido somente para a gerência após a solução.
- Timeline imutável de ações e dashboard com métricas por perfil.
- Dados de demonstração em PostgreSQL.

## Tecnologias e arquitetura

Next.js App Router com React e TypeScript. O backend é implementado com Route Handlers (`app/api`) e o frontend consome essas rotas. Prisma ORM acessa PostgreSQL; Zod valida payloads; bcryptjs protege senhas; a sessão usa cookie `httpOnly`, assinatura HMAC e validade de sete dias.

A autorização é repetida no backend em cada operação. O cliente só consulta seus chamados; técnicos assumem e atualizam os próprios atendimentos; a gerência encerra chamados resolvidos. Cada mudança grava o usuário, horário e descrição no histórico na mesma transação do banco.

## Requisitos

- Node.js 20.9 ou superior
- PostgreSQL 15 ou superior
- npm

## Instalação

```bash
npm install
cp .env.example .env
```

Configure `DATABASE_URL` com usuário, senha, host e banco PostgreSQL disponíveis. Gere um segredo local para `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

Cole o resultado em `.env`. Em seguida, crie o schema e carregue os dados:

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Abra `http://localhost:3000`. Para executar a compilação de produção:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

O seed cria as seis contas e seis chamados de apresentação; quando já existem chamados, ele os preserva para evitar alterar dados de demonstração existentes.

## Variáveis de ambiente

Veja `.env.example`:

- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma.
- `AUTH_SECRET`: segredo aleatório com no mínimo 32 caracteres.

Não compartilhe nem versione `.env`.

## Contas de demonstração

Todas usam a senha `123456`:

| Perfil | Nome | E-mail |
|---|---|---|
| Cliente | VINICIUS MARQUES | `vinicius.marques@hotel.com` |
| Técnico | ENZO SANTANA | `enzo.santana@hotel.com` |
| Técnico | GIULIA MEDEIROS | `giulia.medeiros@hotel.com` |
| Técnico | ARTHUR SALVADOR | `arthur.salvador@hotel.com` |
| Técnico | LUIZ MAINOATH | `luiz.mainoath@hotel.com` |
| Gerência | GERÊNCIA DE TI | `gerencia@hotel.com` |

## Apresentação

O primeiro chamado de demonstração é `CH-000001`, “Computador da recepção sem internet”, aberto e sem responsável. Assim ele está pronto para a equipe assumir e percorrer o restante do fluxo. Para demonstrar uma nova abertura, entre como Vinicius e crie outro chamado; o número seguinte é atribuído automaticamente.

Fluxo: cliente cria → técnico assume → técnico comenta → técnico registra solução (o chamado passa a Resolvido) → gerência encerra. Cada ação aparece na timeline.

## Publicação de demonstração via Cloudflare

Aplicação publicada em **https://hotel.enzostana.space** por um Named Tunnel do Cloudflare.

O registro DNS `hotel.enzostana.space` aponta para o túnel nomeado `hoteldesk-demo`. Um modelo de configuração sem credenciais está em `cloudflared/config.example.yml`. Para configurar outro ambiente, crie um túnel na conta Cloudflare, copie o JSON de credenciais para `~/.cloudflared`, substitua `TUNNEL_ID` e o caminho no arquivo de configuração e crie o registro DNS para `hotel.enzostana.space`.

Nesta máquina, a configuração operacional fica em `.tunnel/config.yml`, com as credenciais guardadas fora do repositório. Para ligar a publicação novamente, mantenha o banco PostgreSQL em execução e inicie o Next.js na porta 3017 junto com o túnel:

```bash
PORT=3017 npm run start
cloudflared tunnel --config .tunnel/config.yml run hoteldesk-demo
```

Depois da apresentação, remova o túnel `hoteldesk-demo` e o registro DNS `hotel.enzostana.space` no Cloudflare. O banco local, as credenciais e a configuração operacional do túnel não são enviados ao GitHub.

## Estrutura principal

```text
app/                 páginas e Route Handlers
components/          componentes de interface
lib/                 autenticação, Prisma, rótulos e respostas de API
prisma/schema.prisma modelos, enums e relações
prisma/seed.ts       contas e chamados de demonstração
```

## Limitações do MVP

- Sessão própria com cookie assinado; sem recuperação de senha ou gestão de usuários.
- Sem e-mail, notificações, anexos, SLA ou integrações externas.
- A publicação depende desta máquina, do PostgreSQL e do processo do Cloudflare Tunnel; não há alta disponibilidade.
