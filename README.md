# DonkeyCode — PI4

Projeto Integrador IV — Unicap 2026.1

---

## Equipe

| Nome                              | RA     |
| --------------------------------- | ------ |
| Iwerson Guilherme da Silva Souza  | 855213 |
| Deivyson Ricardo Silva dos Santos | 855214 |
| Júlia Muniz Cavalheiro de Oliveira| 855158 |
| Ingrid Beatriz Silva              | 855232 |
| Luana Cabral da Silva             | 853756 |
| Ailton Cesar Anizio dos Santos    |        |
| João Vitor Nascimento Paraizo     |        |

---

## Sobre

API em Node.js + Express + Prisma + PostgreSQL para gestão de canteiros, registros semanais e relatórios de plantas forrageiras.

Todo o código de produção e os testes estão dentro da pasta `back-end/`.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- [Docker](https://www.docker.com/) (para subir o PostgreSQL localmente)

## Instalação

Clone o repositório e instale as dependências:

```bash
cd back-end
npm install
```

Crie um arquivo `.env` na pasta `back-end/` com as variáveis necessárias (consulte o time para os valores de produção). Exemplo mínimo para desenvolvimento local:

```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/dev_db"
JWT_SECRET="troque-este-valor"
NODE_ENV="development"
```

## Subindo o banco (Docker)

A partir de `back-end/`:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL na porta `5432` com usuário `postgres`, senha `123` e banco `dev_db`.

## Configurando o Prisma

Sempre que houver mudança nos modelos ou na primeira execução:

```bash
# Apenas gerar o client Prisma
npm run prisma:build

# Gerar client + aplicar migrations no banco
npm run prisma:build:migrate
```

## Executando o programa

Em modo desenvolvimento (com hot reload):

```bash
npm run dev
```

Em modo "produção" local:

```bash
npm start
```

A API sobe em `http://localhost:3000` (porta padrão do Express). A documentação Swagger fica em `http://localhost:3000/docs`.

## Executando os testes

Os testes são **unitários**, usam **mocks** (Prisma, argon2, JWT, Vercel Blob) e **stubs** (objetos fake) — nenhum teste toca o banco real, então não precisa ter o Postgres rodando.

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch (re-executa ao salvar)
npx jest --watch

# Rodar apenas um arquivo
npx jest auth.service.test.ts

# Ver cobertura
npx jest --coverage

# Filtrar por nome do teste
npx jest -t "deve criar usuário"
```

Os testes ficam em:

- `back-end/api/services/tests/` — services
- `back-end/api/controllers/` — controllers
- `back-end/api/middlewares/` — middlewares
- `back-end/teste/services/` — testes adicionais de Registro/Relatório

## Comandos úteis

```bash
# Criar arquivos boilerplate de uma nova entidade
npm run entidade:new NomeDaEntidade

# Excluir os arquivos de uma entidade
npm run entidade:del NomeDaEntidade

# Compilar TypeScript
npm run build
```

## Estrutura do projeto

```
back-end/
├── api/
│   ├── controllers/   # camada HTTP (Express)
│   ├── services/      # regras de negócio
│   │   └── tests/     # testes unitários dos services
│   ├── middlewares/   # auth, etc.
│   ├── models/        # modelos Prisma fragmentados
│   ├── routes/        # rotas Express
│   ├── schemas/       # validação de entrada
│   └── core/          # utilitários (HttpError, etc.)
├── lib/               # cliente Prisma compartilhado
├── prisma/            # schema compilado + migrations
├── cli/               # scripts auxiliares
└── teste/             # testes adicionais
```
