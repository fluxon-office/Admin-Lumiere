# Admin Lumiere

Painel administrativo da Lumiere Clinic para acompanhamento de agenda, solicitações, clientes e serviços.

## Funcionalidades

- Login administrativo integrado ao backend.
- Agenda com visualização por dia, semana e mês.
- Cadastro de agendamentos via API.
- Confirmação, remarcação e cancelamento de atendimentos.
- Confirmação antes de cancelar agendamentos.
- Solicitações com ações rápidas de WhatsApp e ligação.
- Lista de clientes com histórico resumido extraído dos agendamentos.
- Cadastro e edição de serviços via API.
- Controle de serviço ativo e visível no site.
- Feedback visual para ações realizadas.
- Layout responsivo para desktop, iPad/tablet e mobile.
- Bootstrap do primeiro usuário administrativo.

## Tecnologias

- React
- Vite
- Tailwind CSS via plugin do Vite
- Backend Spring Boot na pasta `lumiereclinic`

## Como rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Backend

```bash
cd lumiereclinic
./mvnw spring-boot:run
```

## GitHub Pages

Este projeto está configurado para publicar em:

```text
https://fluxon-office.github.io/Admin-Lumiere/
```

O deploy é feito automaticamente pelo GitHub Actions sempre que houver push na branch `main`.

## Integração

O painel agora consome o backend para:

- autenticação administrativa;
- leitura e criação de agendamentos;
- confirmação, remarcação e cancelamento;
- cadastro e edição de serviços;
- bootstrap do primeiro acesso administrativo.
