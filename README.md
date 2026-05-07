# FitFlow Agent Tester & Eval Pipeline

Sistema de teste e avaliação do agente de vendas FitFlow.

## Como instalar e rodar

1. Clone o repositorio
2. Instale as dependencias:
   npm install
3. Crie o arquivo .env com sua chave:
OPENAI_API_KEY=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
4. Rode o pipeline completo:
   npx tsx src/agent-tester/pipeline-v2.ts

## Estrutura do projeto

- src/agent-tester/ ” Codigo da Parte 1 (Agent Tester)
- src/eval-pipeline/ ” Codigo da Parte 2 (Eval Pipeline)
- data/agent-prompt.md ” Prompt do agente fornecido
- data/results/ ” Resultados gerados (JSONs e relarórios)

## Entrega 1 ” Gerador de Clientes Ocultos

Script: src/agent-tester/generate-clients.ts

O prompt do agente e usa um meta-prompt para gerar N personas diversas via API da OpenAI. O resultado é validado com Zod e salvo em data/results/clients.json.

Para rodar:
npx tsx src/agent-tester/generate-clients.ts

## Entrega 2 ” Simulador de Conversa

Script: src/agent-tester/ss

Implementa um loop onde duas IAs alternam mensagens ” a Mel (agente de vendas) e um cliente ficticio. Cada agente mantem seu proprio historico para simular memória de conversa. O resultado é salvo em JSON.

Para rodar:
npx tsx src/agent-tester/simulate-conversation.ts

## Entrega 3 â€” Pipeline Completo

Script: src/agent-tester/pipeline.ts

Integra as Entregas 1 e 2 em um pipeline Ãºnico. Gera os clientes, roda uma simulação para cada um, trata erros individualmente e salva tudo em data/results/pipeline-results.json.

Para rodar:
npx tsx src/agent-tester/pipeline.ts

## Entrega 4 ” Evolução: Detecção de Encerramento Natural

Script: src/agent-tester/pipeline-v2.ts

Decisão: Implementei detecção automatica  termina naturalmente.

Por que escolhi isso: Analisando as conversas geradas na Entrega 3, percebi que todas eram cortadas no limite de mensagens mesmo quando o assunto já havia se encerrado. Isso tornava as conversas artificiais.

Como funciona: A cada 2 mensagens, um terceiro modelo analisa as ultimas falas e decide se a conversa chegou a um fim natural. Os motivos são:
venda_fechada, lead_desistiu, redirecionado_suporte, conversa_encerrada ou em_andamento.

Resultado: As conversas ficaram mais realistas, encerrando entre 9 e 11 mensagens com motivos identificados.
