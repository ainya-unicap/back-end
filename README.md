
### Criar arquivos da entidade
```
    npm run entidade:new Entidade
```
#### Resultado:
- `Criação` routes/entidade.routes.ts
- `Criação` models/entidade.model.prisma
- `Criação` controllers/entidade.controller.ts
- `Criação` services/entidade.service.ts
### Excluir arquivos da entidade
```
    npm run entidade:del Entidade
```
#### Resultado:
- `Exclusão` routes/entidade.routes.ts
- `Exclusão` models/entidade.model.prisma
- `Exclusão` controllers/entidade.controller.ts
- `Exclusão` services/entidade.service.ts

## Testes Unitários
```
npm test
```
arquivos de teste: `entidade.camada.test`

## Compilar banco de dados
localmente:`npm run prisma:build`
atualizando o banco: `npm run prisma:build:migrate`