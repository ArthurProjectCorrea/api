# Copilot Instructions for AI Coding Agents

## Visão Geral do Projeto
- Este projeto é uma API backend construída com [NestJS](https://nestjs.com/) usando TypeScript.
- Estrutura modular típica do NestJS: `src/` contém controladores, serviços e módulos principais.
- O ponto de entrada é `src/main.ts`. O módulo raiz é `src/app.module.ts`.

## Fluxos de Trabalho Essenciais
- **Instalação de dependências:**
  ```bash
  pnpm install
  ```
- **Execução:**
  - Desenvolvimento: `pnpm run start:dev`
  - Produção: `pnpm run start:prod`
- **Testes:**
  - Unitários: `pnpm run test`
  - E2E: `pnpm run test:e2e`
  - Cobertura: `pnpm run test:cov`

## Convenções e Padrões Específicos
- Use sempre TypeScript e siga os padrões de injeção de dependência do NestJS.
- Os controladores ficam em `src/app.controller.ts` e os serviços em `src/app.service.ts`.
- Testes unitários e e2e estão em `test/` e usam Jest.
- Configurações de build e TypeScript estão em `tsconfig*.json`.
- Use `pnpm` para todos os comandos de dependência e scripts.

## Integrações e Dependências
- O projeto depende fortemente do ecossistema NestJS.
- Não há integrações externas explícitas no repositório, mas siga o padrão de providers e modules do NestJS para adicionar integrações.

## Exemplos de Arquitetura
- Para adicionar um novo recurso, crie um novo módulo, serviço e controlador em `src/` e registre no `app.module.ts`.
- Siga o padrão de injeção de dependências para serviços.

## Dicas para Agentes
- Sempre atualize os testes ao modificar funcionalidades.
- Mantenha a estrutura modular e evite lógica de negócio em controladores.
- Consulte o `README.md` para comandos e instruções de build/teste.

## Arquivos-Chave
- `src/main.ts`: bootstrap da aplicação.
- `src/app.module.ts`: módulo raiz.
- `src/app.controller.ts` e `src/app.service.ts`: exemplos de controlador e serviço.
- `test/`: testes unitários e e2e.

---
Se alguma convenção ou fluxo não estiver claro, peça feedback para atualização deste documento.
