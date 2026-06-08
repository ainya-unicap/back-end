# Relatório de Implementação — Back-end DonkeyCode

> Projeto Integrador IV — Engenharia de Software
> Equipe: Lucas, Bia, Pedro e Marina

---

## Sumário

1. [Visão geral do sistema](#1-visão-geral-do-sistema)
2. [Stack escolhida e justificativas](#2-stack-escolhida-e-justificativas)
3. [Modelagem de domínio](#3-modelagem-de-domínio)
4. [Autenticação e segurança](#4-autenticação-e-segurança)
5. [Arquitetura em camadas](#5-arquitetura-em-camadas)
6. [Upload de arquivos](#6-upload-de-arquivos)
7. [Documentação automática (Swagger)](#7-documentação-automática-swagger)
8. [Testes unitários com mocks e stubs](#8-testes-unitários-com-mocks-e-stubs)
9. [Deploy serverless na Vercel](#9-deploy-serverless-na-vercel)
10. [Auditoria de código e refatorações](#10-auditoria-de-código-e-refatorações)
11. [Métricas finais e conclusão](#11-métricas-finais-e-conclusão)

---

## 1. Visão geral do sistema

O **DonkeyCode** é uma plataforma de apoio acadêmico à disciplina de Forragicultura, voltada para alunos que precisam acompanhar semanalmente o desenvolvimento de plantas forrageiras em canteiros experimentais e entregar um relatório consolidado ao final do período letivo.

O back-end aqui descrito implementa **toda a regra de negócio do sistema**: cadastro e autenticação de usuários (aluno, professor, admin), gestão de canteiros e vínculos aluno↔canteiro, coleta semanal de dados (formulários com checklist, medições numéricas e fotografias) e ciclo de vida do relatório acadêmico (rascunho → submetido → corrigido).

São **17 entidades de domínio**, **~60 endpoints REST**, **218 testes unitários** e cobertura completa de OpenAPI 3.0 servida via Swagger UI. O sistema roda em produção na Vercel com banco PostgreSQL no Neon.

> **Pedro:** Antes da gente começar a codar, alguém entendeu o que a professora quer?
>
> **Marina:** Basicamente: aluno escolhe uma planta, planta no canteiro dele, e toda semana mede altura, número de folhas, tira foto, e responde se irrigou, adubou, podou. No fim do semestre escreve um relatório.
>
> **Lucas:** E o professor corrige no sistema mesmo?
>
> **Bia:** Sim. Por isso tem o status `SUBMETIDO` e `CORRIGIDO`. A gente nem precisa fazer tela de correção agora, só os endpoints.

---

## 2. Stack escolhida e justificativas

### 2.1 Linguagem e runtime

- **TypeScript (ESM)** sobre Node.js
- **Express 4** como framework HTTP

A escolha por TypeScript foi pelo *type safety* — em um sistema com 17 entidades e ~60 endpoints, autocomplete e validação em tempo de compilação reduzem drasticamente o tempo gasto debugando typos. ESM (em vez de CommonJS) foi escolhida pelo alinhamento com o ecossistema moderno (Vite, Vercel, Prisma 7).

### 2.2 ORM e banco

- **Prisma 7** + **`@prisma/adapter-pg`**
- **PostgreSQL** hospedado no **Neon** (free tier, serverless)

Prisma traz um schema declarativo (`schema.prisma`) que documenta o domínio, gera o cliente TypeScript com tipos completos, e oferece migrations versionadas no Git. O adapter `pg` é exigência do Prisma 7 — não dá mais para usar `new PrismaClient()` direto.

### 2.3 Demais dependências de runtime

| Pacote | Função |
|---|---|
| `argon2` | Hash de senhas (recomendado pelo OWASP) |
| `jsonwebtoken` | Geração e validação de JWT |
| `express-rate-limit` | Rate limiting no endpoint de login |
| `multer` | Recebimento de upload multipart |
| `@vercel/blob` | Object storage em produção |
| `pdfkit` | Geração de PDF do relatório |
| `swagger-ui-express` | UI do OpenAPI |
| `cors` | Habilitação de CORS |

### 2.4 Ferramentas de desenvolvimento

- **Jest** + **ts-jest** para testes unitários
- **tsx** para executar TS sem build (dev e seed)
- **Prisma CLI** para migrations

> **Lucas:** Por que a gente não usou bcrypt? Era o que eu vi no curso.
>
> **Bia:** Bcrypt ainda funciona, mas argon2 ganhou o Password Hashing Competition em 2015 e é a recomendação atual do OWASP. É mais resistente a ataques com GPU.
>
> **Lucas:** Faz diferença pro nosso caso?
>
> **Bia:** Pro TCC, qualquer um passaria. Mas argon2 é literalmente "a versão certa hoje" — não custa nada usar.
>
> **Pedro:** Vamos de argon2 então. Próximo problema: Express 4 ou 5?
>
> **Marina:** Express 5 ainda tá em beta, vários packages não suportam direito. Bora ficar no 4.

---

## 3. Modelagem de domínio

### 3.1 Visão geral das entidades

O schema Prisma define 17 modelos organizados em quatro grupos:

**Identidade e estrutura institucional:**
- `User` — usuário do sistema (aluno, professor, admin)
- `Institution` — universidade/faculdade
- `Turma`, `AlunoTurma` — estrutura de classes
- `AcademicPeriod` — semestre letivo (ex.: "2026.1")
- `RefreshToken` — tokens persistidos para refresh rotation

**Domínio agronômico:**
- `PlantaForrageira` — catálogo de plantas (Brachiaria, Stylosanthes, etc.)
- `PlantTemplate` — campos esperados de medição por planta
- `Canteiro` — unidade física de cultivo
- `UserCanteiro` — vínculo aluno↔canteiro (tabela de junção)

**Coleta semanal:**
- `ListaDeFormularios` — agrupamento por semana
- `Formulario` — preenchimento de uma sessão de coleta
- `Checklist` — itens marcados pelo aluno (irrigação, adubação, etc.)
- `Measurement` — valores numéricos (altura, cobertura do solo, etc.)
- `Photo` — fotos da planta

**Relatório final:**
- `Relatorio` — documento consolidado com status

### 3.2 Chaves primárias compostas

Duas tabelas de junção usam **`@@id` composto** em vez de um id sintético:

```prisma
model UserCanteiro {
  user_id     String
  canteiro_id String
  // ...
  @@id([user_id, canteiro_id])
}

model AlunoTurma {
  user_id  String
  turma_id String
  // ...
  @@id([user_id, turma_id])
}
```

Isso garante **unicidade ao nível do banco** — impossível ter dois registros do mesmo (user, canteiro) ou (user, turma).

### 3.3 Migrations e evolução do schema

O projeto usa Prisma Migrate. Cada alteração de schema gera um arquivo SQL versionado em `prisma/migrations/`. Migrações importantes documentadas:

- `20260524115735_full_schema` — schema inicial completo
- `20260524160000_add_user_avatar_url` — adicionou suporte a foto de perfil
- `20260524170000_drop_dead_aluno_table` — removeu tabela órfã
- `20260524180000_alunoturma_composite_pk` — corrigiu chave primária com deduplicação
- `20260524190000_relatorio_rename_submited_at` — correção de typo

> **Marina:** A gente colocou `AlunoTurma` com PK composta desde o começo?
>
> **Pedro:** Não, descobriu isso na revisão de código depois. Tava com `id String @id @default(uuid())`, igual ao Prisma sugere no padrão.
>
> **Lucas:** Aí qual era o problema?
>
> **Pedro:** Permitia vincular o mesmo aluno na mesma turma duas vezes. Tipo, alguém clica duas vezes em "Adicionar" e o banco aceita. Vira inconsistência silenciosa.
>
> **Bia:** UserCanteiro a gente já tinha feito com `@@id` desde o início porque é uma tabela de junção "óbvia". AlunoTurma a gente esqueceu, ficou só "uma tabela com dois FKs".
>
> **Lucas:** E pra corrigir teve que dropar dados?
>
> **Pedro:** A migration tem um `DELETE` que mantém o registro mais antigo de cada par antes de trocar a PK. Em produção isso preserva quem foi vinculado primeiro. Funcionou porque não tinha duplicatas reais ainda, mas o script tá protegido.

---

## 4. Autenticação e segurança

### 4.1 Arquitetura geral

A autenticação combina **três mecanismos** complementares:

| Mecanismo | Função |
|---|---|
| Argon2 | Hashing de senha (irreversível) |
| JWT (HS256) | Access token de curta duração (15min) |
| Refresh token opaco | Rotação de credenciais (7 dias) |

### 4.2 Cadastro

O endpoint `POST /api/users` é **público** (sem `Authorization`). O `UserService.create` valida campos obrigatórios e gera o hash da senha com `argon2.hash` antes de persistir.

```ts
await prisma.user.create({
    data: {
        name, email, role,
        password: await argon2.hash(body.password),
        ...(body.institutionId && { institution: { connect: { id: body.institutionId } } }),
    },
});
```

### 4.3 Login

`POST /api/users/login` valida email e senha (`argon2.verify`), depois chama `AuthService.generateTokens(userId)` que:

1. Assina um JWT com `{ sub: userId }` e expiração de 15 minutos
2. Gera 40 bytes aleatórios via `crypto.randomBytes`, salva como refresh token no banco com vencimento em 7 dias

A resposta inclui **`id`, `accessToken` e `refreshToken`** — o `id` foi adicionado depois pra evitar uma chamada extra do front pedindo `/users/me`.

### 4.4 Refresh rotation

`POST /api/users/refresh` recebe o refresh token, valida no banco (verifica `revoked` e `expiresAt`), **deleta o token usado** e gera um novo par. Esse padrão limita o blast radius de um refresh vazado: assim que ele é usado, perde validade.

### 4.5 Middleware `requireAuth`

Em `api/middlewares/auth.middleware.ts`, o middleware:
1. Lê o header `Authorization: Bearer <token>`
2. Faz `jwt.verify(token, process.env.JWT_SECRET)`
3. Injeta `req.user = { id: payload.sub }` no Request
4. Retorna **401** com mensagem clara em caso de erro

A interface global do Express foi estendida (`api/types/express.d.ts`) para que `req.user` seja tipado em todos os controllers, sem cast manual.

### 4.6 Rate limiting no login

Para mitigar brute-force, o endpoint `POST /api/users/login` recebe `loginLimiter`: **10 tentativas por IP a cada 15 minutos**, com resposta `429 Too Many Requests`.

### 4.7 Ownership checks

Apenas o **dono** de um recurso pode editá-lo. Implementado em dois padrões:

**a) Controller verifica:** quando o ID está no path (`/users/:id/profile`)
```ts
if (req.user!.id !== id) throw new HttpError("Você só pode atualizar o próprio perfil", 403);
```

**b) Service verifica:** quando o ID precisa de query (`/relatorios/:id/submit`)
```ts
private static async assertOwnership(id: string, userId: string) {
    const relatorio = await prisma.relatorio.findUnique({ where: { id } });
    if (!relatorio) throw new HttpError("Relatório não encontrado", 404);
    if (relatorio.user_id !== userId) throw new HttpError("Você só pode alterar os próprios relatórios", 403);
    return relatorio;
}
```

> **Lucas:** Espera, mas eu vi no código antigo que o `created_by` vinha no body do POST de lista. A gente não confiava no JWT?
>
> **Bia:** Pois é, isso a gente refatorou no meio do projeto. Originalmente o front mandava `user_id` no body de tudo. Aí o Pedro percebeu que qualquer aluno autenticado podia criar lista "em nome de outro" só mandando outro id no body.
>
> **Pedro:** Bug clássico de quem aprendeu CRUD genérico mas não pensou em autorização. Cinco endpoints estavam expostos: listas, formulários, relatórios, user-canteiros, canteiros.
>
> **Lucas:** E agora pega do `req.user.id`?
>
> **Pedro:** Sempre. O JWT é a única fonte de verdade pra identidade. O body do request é input não confiável.
>
> **Marina:** Isso também simplifica o front, né? Em vez de mandar `user_id` em todo body, ele só manda o token.

---

## 5. Arquitetura em camadas

### 5.1 Padrão de organização

Cada entidade segue o mesmo esqueleto:

```
api/
├── routes/         ← Definição de URL + middleware
├── controllers/    ← Tradução HTTP ↔ domínio
├── services/       ← Regra de negócio
├── schemas/        ← Tipos TypeScript de input
└── core/           ← Utilitários (HttpError, etc.)
```

### 5.2 Fluxo de uma request

Exemplo: `POST /api/listas-formularios`

1. **Route** (`listadeformularios.routes.ts`) — define método, path, middleware (`requireAuth`)
2. **Controller** (`listadeformularios.controller.ts`) — extrai body, injeta `user_id` do JWT, chama o service, monta resposta JSON
3. **Service** (`listadeformularios.service.ts`) — valida regras (vínculo UserCanteiro existe? plant_id deriva do canteiro?), persiste via Prisma
4. **Volta:** Service retorna entidade → Controller serializa → Express envia HTTP 201

### 5.3 Tratamento de erros

Toda a base usa a classe `HttpError` (`api/core/httpError.ts`):

```ts
export class HttpError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}
```

Os controllers seguem o padrão `try { ... } catch (err: HttpError | any)` e retornam `res.status(err.status || 500).json({ error: err.message })`. Isso permite que o service jogue `throw new HttpError(..., 404)` e o controller propague corretamente sem boilerplate.

### 5.4 Static methods

Os services e controllers usam **classes com métodos estáticos** (`UserService.create(...)`, `AuthController.login(...)`). A decisão foi por simplicidade — não há estado por instância, e o padrão facilita o mocking nos testes (`jest.mock("...service")` substitui todos os métodos de uma vez).

> **Lucas:** Não era melhor usar classe normal com `new`?
>
> **Marina:** Pra que? A gente nunca vai ter duas instâncias do `UserService`. É só um namespace de funções, basicamente.
>
> **Bia:** E pra testar dá muito menos boilerplate. `jest.mock` em static method é uma linha.
>
> **Lucas:** Beleza. Mas então por que classe e não só funções soltas?
>
> **Pedro:** Organização. `UserService.create()` lê melhor que `userService.create()` import-import-import. E IntelliSense já mostra todos os métodos quando você digita `UserService.`. Pra junior level também é mais didático.

---

## 6. Upload de arquivos

### 6.1 O problema

Endpoints como `POST /formularios/:id/photos` (foto da planta) e `PUT /users/:id/avatar` (foto de perfil) recebem arquivos binários via multipart. Tradicionalmente isso seria gravado em disco — mas a Vercel **não tem filesystem persistente**.

### 6.2 Solução: Multer com storage condicional

Em `api/middlewares/upload.middleware.ts`:

```ts
const isVercel = !!process.env.VERCEL;
const storage = isVercel ? multer.memoryStorage() : diskStorage;
```

- **Em dev local:** `diskStorage` salva em `public/uploads/` (funciona com `npm run dev`)
- **Em produção:** `memoryStorage` deixa o arquivo em `req.file.buffer` para upload ao Vercel Blob

### 6.3 Vercel Blob na prática

No `PhotoController.createForFormulario`:

```ts
if (process.env.VERCEL) {
    const blob = await put(
        `photos/${Date.now()}-${req.file.originalname}`,
        req.file.buffer,
        { access: "public", contentType: req.file.mimetype }
    );
    fileUrl = blob.url;  // URL pública permanente
} else {
    fileUrl = `/uploads/${req.file.filename}`;
}
```

O banco grava apenas a URL — em produção é uma URL externa do Blob (`https://xyz.public.blob.vercel-storage.com/photos/...`), em dev é um path relativo.

### 6.4 Cleanup automático no delete

Quando uma `Photo` é deletada, o `PhotoService.delete` detecta pelo prefixo da URL e libera o arquivo físico:

```ts
if (photo.url.startsWith("http")) {
    await del(photo.url);  // API do @vercel/blob
} else if (photo.url.startsWith("/uploads/")) {
    fs.unlinkSync(path.resolve("public/uploads", filename));
}
```

Tudo dentro de `try/catch` — uma falha do Blob não derruba a requisição.

> **Marina:** Espera, deploy na Vercel só com `multer.diskStorage` quebrava?
>
> **Pedro:** Totalmente. Cold start dava EROFS read-only filesystem ao tentar `mkdirSync('public/uploads')`. O app nem subia.
>
> **Lucas:** Como vocês descobriram?
>
> **Pedro:** Primeiro deploy, primeiro request da rota de upload: stack trace gigante no painel. Aí lembrei que serverless é efêmero.
>
> **Bia:** A solução do Blob foi smooth. A API é literalmente `put(filename, buffer)` e devolve a URL. Free tier dá 1GB de armazenamento e 10GB de banda por mês, dá com folga pra TCC.
>
> **Lucas:** E se rolar de algum dia eu querer migrar pra AWS S3?
>
> **Pedro:** Troca dois imports e a função `put`. O resto fica igual. Por isso isolamos no controller.

---

## 7. Documentação automática (Swagger)

### 7.1 Especificação OpenAPI 3.0

O spec é construído em código TypeScript (`api/swagger/index.ts`) compondo:
- 12 schemas reutilizáveis em `schemas.ts` (UserCreate, LoginRequest, etc.)
- 18 arquivos de paths organizados por domínio em `swagger/paths/`
- Security global `bearerAuth` herdado por todos os endpoints (com override `security: []` para os públicos)

### 7.2 Modularização

Originalmente toda a spec ficava num único arquivo de 1174 linhas. Foi quebrada em 19 arquivos pequenos sem alterar o output gerado (validado por comparação do JSON):

```
api/swagger/
├── index.ts          (composição final)
├── schemas.ts        (12 schemas reutilizáveis)
└── paths/
    ├── auth.ts
    ├── users.ts
    ├── canteiros.ts
    ├── ...
    └── health.ts
```

### 7.3 Exemplos em todos os endpoints

Cada endpoint declara `responses.<status>.content."application/json".example` com um JSON realista que aparece no Swagger UI sob a aba *Example value*. Isso elimina a necessidade do front "descobrir" o formato — basta ler.

### 7.4 Servindo a UI

Em `api/index.ts`:

```ts
app.use("/api/docs",
    swaggerUi.serveFiles(swaggerSpec, swaggerUiOptions),
    swaggerUi.setup(swaggerSpec, swaggerUiOptions));
```

Com a opção `customCssUrl` apontando para CDN (`jsdelivr.net`), porque o `serve` padrão tenta servir os assets de `node_modules/swagger-ui-dist/` — o que **não funciona em serverless**.

> **Lucas:** A primeira vez que abri /api/docs na Vercel veio tela em branco.
>
> **Pedro:** Clássico. O `swaggerUi.serve` é um `express.static` apontando pro `node_modules/swagger-ui-dist/`, mas o builder do `@vercel/node` não bundleia esse pacote. Daí o HTML carrega mas o CSS/JS dão 404.
>
> **Bia:** Solução? Apontar pra CDN no jsDelivr. UI carrega de fora, a API só serve o HTML.
>
> **Marina:** Funcionou de primeira. Bom uptime, gratuito, cache global.
>
> **Lucas:** E a parte dos exemplos? Cada endpoint tem.
>
> **Bia:** Esse foi um dia inteiro de trabalho. 50+ endpoints, escrevendo JSON realista pra cada um. UUIDs consistentes entre arquivos, datas ISO 8601, dados de domínio reais (Brachiaria brizantha, Stylosanthes guianensis). Vale a pena porque o front consegue ler a spec e gerar tipos automaticamente.

---

## 8. Testes unitários com mocks e stubs

### 8.1 Stack de teste

- **Jest 30** como runner
- **ts-jest** para compilar TypeScript on the fly
- Configuração mínima em `jest.config.ts` com `moduleNameMapper` para resolver os imports ESM com `.js` no final

### 8.2 Estratégia: mock everything externo

Em testes unitários, **nenhuma chamada real** é feita:
- Prisma é mockado com `jest.mock("../../lib/prisma")`
- argon2 é mockado com `jest.mock("argon2")`
- jsonwebtoken com `jest.mock("jsonwebtoken")`
- @vercel/blob com `jest.mock("@vercel/blob")`
- crypto.randomBytes via `jest.spyOn`

Os testes nunca tocam no Neon — rodam offline, em milissegundos.

### 8.3 Exemplo de teste de service

```ts
// api/services/tests/auth.service.test.ts
it("deve retornar accessToken e refreshToken quando credenciais são válidas", async () => {
    prismaUserMock.findUnique.mockResolvedValue(userStub);
    argon2Mock.verify.mockResolvedValue(true as never);
    prismaRefreshMock.create.mockResolvedValue({} as any);

    const tokens = await AuthService.login({ email: "joao@email.com", password: "123456" });

    expect(argon2Mock.verify).toHaveBeenCalledWith("hashed-pass", "123456");
    expect(jwtMock.sign).toHaveBeenCalledWith({ sub: "user-1" }, "test-secret", expect.objectContaining({ expiresIn: "15m" }));
    expect(tokens.id).toBe("user-1");
    expect(tokens.accessToken).toBe("fake-access-token");
});
```

### 8.4 Cobertura

A suite cobre, para cada service e controller principal:
- **Happy path** com o input válido
- **Validação de input** (campos obrigatórios faltando)
- **Estados do domínio** (usuário não existe, senha errada, status não permite ação)
- **Ownership** (403 quando outro user tenta editar)
- **Erros propagados** (banco caiu, blob falhou)

### 8.5 Resultado

```
Test Suites: 22 passed, 22 total
Tests:       218 passed, 218 total
Time:        ~10s
```

> **Lucas:** Por que mockar o Prisma? Não era melhor usar um banco de teste real?
>
> **Bia:** Pra teste **unitário**, mock. Pra teste **de integração**, banco real. Aqui a gente cobriu unitário, que é o que valida regra de negócio sem depender de infra.
>
> **Pedro:** E rapidez. 218 testes em 10 segundos. Se a gente subisse banco real, seria minutos por rodada.
>
> **Marina:** A professora pediu mock e stub explicitamente na atividade "Testes de Integração - Mocks". A gente cumpre o requisito.
>
> **Lucas:** Como vocês decidiram o que testar?
>
> **Bia:** Comecei pelos services. Service é onde mora a regra. Controller é casca, testa só o "chama o service certo e devolve o status certo".
>
> **Pedro:** Ownership foi o lugar com mais testes (4 cenários: dono / outro / não existe / submetido). Porque é segurança real — bug ali é exploit.

---

## 9. Deploy serverless na Vercel

### 9.1 Configuração base

O `vercel.json` instrui a Vercel a tratar `api/index.ts` como **uma única função serverless** que recebe todas as rotas:

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```

### 9.2 Gating do `app.listen`

Em ambiente serverless, **não pode ter `app.listen`** rodando — a Vercel importa o `app` exportado e gerencia o HTTP por conta dela. Localmente, o `npm run dev` precisa do listen pra subir o servidor.

```ts
if (!process.env.VERCEL) {
    app.listen(port, () => console.log(`Server is running in http://localhost:${port}`));
}
```

A variável `VERCEL=1` é setada automaticamente pela plataforma — em dev local ela não existe, então o listen roda.

### 9.3 Migrations automáticas no deploy

O script `vercel-build` no `package.json`:

```json
"vercel-build": "prisma generate && prisma migrate deploy"
```

A Vercel chama esse script no build → o Prisma aplica todas as migrations pendentes no banco antes do app subir. Sem ação manual.

### 9.4 Environment variables

Configuradas no painel da Vercel:

| Variável | Função |
|---|---|
| `DATABASE_URL` | Conexão com o Neon (com `?pgbouncer=true`) |
| `JWT_SECRET` | Chave de assinatura do JWT (string longa aleatória) |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob (auto-gerado ao conectar o storage) |
| `NODE_ENV=production` | Definido automaticamente pela Vercel |

### 9.5 Swagger UI no domínio de produção

O `swaggerSpec.servers` lista os dois ambientes:

```ts
servers: [
    { url: "https://back-end-ainya.vercel.app/api", description: "produção (Vercel)" },
    { url: `http://localhost:${port}/api`, description: "local" },
],
```

No Swagger UI aparece um dropdown que permite testar contra qualquer um sem mudar arquivo.

> **Marina:** Lembra do dia que a gente tentou subir e o JWT_SECRET tava errado?
>
> **Pedro:** O login estourou na primeira request. `secretOrPrivateKey must have a value`. O `process.env.JWT_SECRET!` com `!` engana o TypeScript, mas em runtime se faltar a env var, a chamada de `jwt.sign` quebra na hora.
>
> **Lucas:** Solução é colocar a env var, não?
>
> **Bia:** Sim, mas o ideal seria validar no boot — falhar rápido com mensagem clara. Adicionamos como próximo passo.
>
> **Pedro:** Sobre o `vercel-build`, isso foi importante. Antes do automatismo a gente precisava fazer `npx prisma migrate deploy` antes de cada deploy. Já esqueci uma vez e o app subiu com banco desatualizado.
>
> **Marina:** O dia que o /upload deu 500 também foi essa frustração — só percebi depois de 20 minutos que o Blob token tinha vencido.

---

## 10. Auditoria de código e refatorações

Durante o desenvolvimento foi feita uma **revisão sistemática** do código que identificou seis categorias de problemas. Os críticos foram corrigidos, os demais documentados.

### 10.1 ✅ `plant_id` redundante em ListaDeFormularios

**Problema:** O body de `POST /listas-formularios` exigia `canteiro_id` E `plant_id` separados. Mas o canteiro já sabe qual planta tem. Pior: não havia validação de que os dois batiam, abrindo brecha para inconsistência.

**Correção:** Service agora deriva `plant_id` automaticamente do canteiro consultado. O body deixou de pedir esse campo.

```ts
const canteiro = await prisma.canteiro.findUnique({
    where: { id: canteiro_id },
    select: { plant_id: true },
});
// usa canteiro.plant_id para preencher a lista
```

### 10.2 ✅ Model `aluno` morto removido

A tabela `aluno` (minúsculo) tinha 3 campos genéricos (`id`, `createdAt`, `updatedAt`), zero relações, zero usos no código. Provavelmente herança de exploração inicial. Removida via migration `DROP TABLE IF EXISTS "aluno"`.

### 10.3 ✅ `user_id` no body movido para JWT

Seis endpoints aceitavam `user_id`/`created_by` no body, permitindo agir em nome de outro autenticado. Refatorados para usar `req.user.id` exclusivamente:

- `POST /listas-formularios`
- `POST /formularios`
- `POST /relatorios/generate`
- `POST /user-canteiros`
- `DELETE /user-canteiros`
- `POST /canteiros`

Mais ownership checks adicionados em:
- `PUT /users/:id/profile`
- `PUT /users/:id/avatar`
- Todos os `PUT /relatorios/:id/*`
- `POST /relatorios/:id/submit`

### 10.4 ✅ `AlunoTurma` com chave primária composta

Já documentada na Seção 3.2. Migration com deduplicação antes do `DROP CONSTRAINT`.

### 10.5 ✅ Typo `submited_at` → `submittedAt`

Renomeado via `ALTER TABLE ... RENAME COLUMN` (preserva dados). Service e arquivo de model atualizados.

### 10.6 ⏭️ Decisões mantidas

Três achados foram avaliados e **decidimos não mexer**:

- **`Relatorio.canteiro_id` denormalizado:** o service já deriva corretamente; manter coluna evita JOIN extra em queries futuras (otimização legítima).
- **`Turma.institution_id` opcional:** decisão de domínio (a equipe ainda não sabe se turma sempre tem instituição). Marcado para conversa com o cliente.
- **`Relatorio.references` (palavra reservada SQL):** Prisma escapa com aspas duplas. Não quebra. Renomear é alto custo, baixo benefício.

> **Pedro:** A auditoria foi 1 dia inteiro de leitura passiva, anotando coisas.
>
> **Lucas:** O do user_id no body foi o que mais me chocou. Eu tava mandando isso em todo POST sem pensar.
>
> **Bia:** Bug clássico de quem aprendeu CRUD genérico. "Receber e salvar" parece inocente. Mas autorização é "quem pode salvar o quê" — e isso vem da identidade, não do input.
>
> **Marina:** O pulo do gato foi não fazer tudo de uma vez. A gente listou os 6, fez os 4 críticos, deixou os 2 cosméticos pro futuro.
>
> **Pedro:** Sobre o model `aluno` morto: a parte que eu mais gostei foi descobrir que dava pra remover com `grep` por `prisma.aluno` (zero resultados) e ter certeza que nada usava. TypeScript ajudaria a confirmar antes de subir.

---

## 11. Métricas finais e conclusão

### 11.1 Números do projeto

| Métrica | Valor |
|---|---|
| Entidades de domínio | 17 |
| Endpoints REST | ~60 |
| Linhas de código (api/) | ~3.500 |
| Linhas de schema Prisma | ~245 |
| Migrations versionadas | 5 |
| Testes unitários | 218 |
| Suites de teste | 22 |
| Tempo de teste | ~10s |
| Arquivos de spec OpenAPI | 19 |
| Collections Postman | 2 |

### 11.2 O que o sistema entrega hoje

- ✅ Cadastro e autenticação completa (JWT + refresh rotation + rate limit)
- ✅ CRUD de todas as 17 entidades, com regras de negócio aplicadas
- ✅ Upload de fotos via Vercel Blob em produção
- ✅ Geração de PDF do relatório via pdfkit
- ✅ Swagger UI publicado em `/api/docs` com exemplos em todos os endpoints
- ✅ Deploy contínuo na Vercel + migrations automáticas no build
- ✅ 218 testes unitários com mocks e stubs (Prisma, argon2, jwt, blob)
- ✅ Postman collections prontas (fluxo principal e completa) para apresentação e exploração

### 11.3 O que ficou de fora (próximos passos)

- **Geração de relatório por IA:** o endpoint `POST /relatorios/generate` hoje só cria um rascunho com objetivo template. Próxima iteração planejada: integração com Claude para gerar drafts das seções a partir dos dados coletados (formulários, medições, fotos).
- **CORS restrito por whitelist:** atualmente aberto (`cors()` sem opções). Para produção real, restringir aos domínios do front via env var.
- **Rate limit com Redis store:** o limiter em memória funciona por instância de serverless. Para escalar precisa de store externo (Upstash Redis).
- **Validação de env vars no boot:** falhar rápido se `JWT_SECRET`/`DATABASE_URL` faltarem, em vez de quebrar na primeira request.
- **Testes de integração:** complementar os unitários com testes HTTP via `supertest`.

### 11.4 Considerações finais da equipe

> **Pedro:** O que eu mais aprendi foi a importância da **camada de segurança ser silenciosa quando funciona**. O ownership check só "aparece" se alguém tentar fazer algo errado.
>
> **Bia:** Pra mim foi o Prisma. Schema declarativo, types auto-gerados, migrations versionadas... antes eu pensava ORM era over-engineering. Pro nosso domínio com 17 entidades, foi um time-saver gigante.
>
> **Lucas:** Eu entendi que **mock e stub não é teste falso, é teste isolado**. Quando o teste passa, eu sei que MEU código tá certo, independente do banco/lib/API externa.
>
> **Marina:** Pra mim foi a auditoria. A gente sentou, leu o código sem mexer, listou problemas, priorizou. Esse processo é tão importante quanto a codagem em si.
>
> **Pedro:** Se vocês tivessem 15 minutos pra falar do back-end na banca, o que falariam?
>
> **Bia:** Eu mostraria o fluxo dos 7 endpoints no Postman.
>
> **Lucas:** Eu falaria do ownership check. É a parte que parece simples mas tira meio dia pra entender bem.
>
> **Marina:** Eu mostraria o Swagger UI rodando contra a produção. Cliques e cliques e cliques. Não tem como argumentar que "não funciona".

---

*Documento atualizado em 2026-05-29.*
