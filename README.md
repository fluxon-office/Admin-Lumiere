# Admin Lumiere

Painel administrativo da Lumiere Clinic para acompanhamento de agenda, solicitações, clientes e serviços.

## Funcionalidades

- Login administrativo visual.
- Agenda com visualização por dia, semana e mês.
- Cadastro local de agendamentos.
- Confirmação, remarcação e cancelamento de atendimentos.
- Confirmação antes de cancelar agendamentos.
- Solicitações com ações rápidas de WhatsApp e ligação.
- Lista de clientes com histórico resumido.
- Cadastro e edição de serviços.
- Controle de serviço ativo e visível no site.
- Feedback visual para ações realizadas.
- Persistência temporária em `localStorage`.
- Layout responsivo para desktop, iPad/tablet e mobile.

## Tecnologias

- React
- Vite
- Tailwind CSS via plugin do Vite

## Como rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## GitHub Pages

Este projeto está configurado para publicar em:

```text
https://fluxon-office.github.io/Admin-Lumiere/
```

O deploy é feito automaticamente pelo GitHub Actions sempre que houver push na branch `main`.

## Observação para integração

Hoje o painel usa dados locais e `localStorage` para simular persistência. Quando o backend estiver pronto, os pontos de troca principais serão:

- agendamentos;
- clientes;
- serviços;
- autenticação;
- publicação de serviços no site.
