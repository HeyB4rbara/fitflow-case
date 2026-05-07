# FitFlow Agent Tester & Eval Pipeline

Sistema de teste e avaliação do agente de vendas FitFlow.

## Como instalar e rodar

1. Clone o repositÃ³rio
2. Instale as dependÃªncias:
   npm install
3. Crie o arquivo .env com sua chave:
   OPENAI_API_KEY=sua_chave_aqui
4. Rode o pipeline completo:
   npx tsx src/agent-tester/pipeline-v2.ts

## Estrutura do projeto

- src/agent-tester/ â€” CÃ³digo da Parte 1 (Agent Tester)
- src/eval-pipeline/ â€” CÃ³digo da Parte 2 (Eval Pipeline)
- data/agent-prompt.md â€” Prompt do agente fornecido
- data/results/ â€” Resultados gerados (JSONs e relatÃ³rios)

## Entrega 1 â€” Gerador de Clientes Ocultos

Script: src/agent-tester/generate-clients.ts

LÃª o prompt do agente e usa um meta-prompt para gerar N personas diversas via API da OpenAI. O resultado Ã© validado com Zod e salvo em data/results/clients.json.

Para rodar:
npx tsx src/agent-tester/generate-clients.ts

## Entrega 2 â€” Simulador de Conversa

Script: src/agent-tester/ss

Implementa um loop onde duas IAs alternam mensagens â€” a Mel (agente de vendas) e um cliente fictÃ­cio. Cada agente mantÃ©m seu prÃ³prio histÃ³rico para simular memÃ³ria de conversa. O resultado Ã© salvo em JSON.

Para rodar:
npx tsx src/agent-tester/simulate-conversation.ts

## Entrega 3 â€” Pipeline Completo

Script: src/agent-tester/pipeline.ts

Integra as Entregas 1 e 2 em um pipeline Ãºnico. Gera os clientes, roda uma simulaÃ§Ã£o para cada um, trata erros individualmente e salva tudo em data/results/pipeline-results.json.

Para rodar:
npx tsx src/agent-tester/pipeline.ts

## Entrega 4 â€” EvoluÃ§Ã£o: DetecÃ§Ã£o de Encerramento Natural

Script: src/agent-tester/pipeline-v2.ts

DecisÃ£o: Implementei detecÃ§Ã£o automÃrsa termina naturalmente.

Por que escolhi isso: Analisando as conversas geradas na Entrega 3, percebi que todas eram cortadas no limite de mensagens mesmo quando o assunto jÃ¡ havia se encerrado. Isso tornava as conversas artificiais.

Como funciona: A cada 2 mensagens, um terceiro modelo analisa as Ãºltimas falas e decide se a conversa chegou a um fim natural. Os motivos ssÃ­veis sÃ£o: venda_fechada, lead_desistiu, redirecionado_suporte, conversa_encerrada ou em_andamento.

Resultado: As conversas ficaram mais realistas, encerrando entre 9 e 11 mensagens com motivos identificados.
