import fs from "fs";
import path from "path";
import { config } from "dotenv";
import OpenAI from "openai";
import { z } from "zod";

config();

// Define o formato exato que cada cliente deve ter
// O Zod garante que a IA sempre devolva esse formato, sem campos faltando
const ClientSchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
});

const ClientsSchema = z.object({
  clients: z.array(ClientSchema),
});

async function generateClients(numberOfClients: number) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Lê o prompt do agente para a IA entender o contexto
  const agentPrompt = fs.readFileSync(
    path.join(process.cwd(), "data", "agent-prompt.md"),
    "utf-8"
  );

  console.log(`Gerando ${numberOfClients} clientes ocultos...`);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é um especialista em criar personas de clientes fictícios para testar agentes de vendas.
        
Sempre responda APENAS com JSON válido, sem texto adicional, sem markdown, sem blocos de código.`,
      },
      {
        role: "user",
        content: `Com base neste prompt de agente de vendas, crie exatamente ${numberOfClients} personas de clientes ocultos para testar o agente.

PROMPT DO AGENTE:
${agentPrompt}

Crie personas DIVERSAS e REALISTAS. Inclua:
- Leads qualificados e animados (maioria)
- Leads com objeção de preço
- Leads indecisos que precisam de mais informações
- Leads com perguntas específicas sobre o produto
- Um lead difícil ou mal-humorado
- Um lead que já é cliente e precisa de suporte

Para cada persona, crie:
- name: nome brasileiro comum
- description: 1-2 frases descrevendo o perfil e o objetivo do teste
- prompt: o system prompt completo que essa persona usará. Deve instruir a IA a se comportar como esse cliente, incluindo: personalidade, objetivo, objeções específicas, e a instrução de encerrar a conversa naturalmente quando fizer sentido

Responda APENAS com este JSON, sem nenhum texto antes ou depois:
{
  "clients": [
    {
      "name": "string",
      "description": "string", 
      "prompt": "string"
    }
  ]
}`,
      },
    ],
  });

  const rawContent = response.choices[0].message.content || "";

  // Converte o texto da IA em objeto JavaScript
  const parsed = JSON.parse(rawContent);

  // Valida que o formato está correto usando o Zod
  // Se algum campo estiver faltando, o Zod vai lançar um erro claro
  const validated = ClientsSchema.parse(parsed);

  // Salva o resultado em arquivo JSON
  const outputPath = path.join(process.cwd(), "data", "results", "clients.json");
  fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2), "utf-8");

  console.log(`✅ ${validated.clients.length} clientes gerados com sucesso!`);
  console.log(`📁 Arquivo salvo em: data/results/clients.json`);
  console.log("\nClientes gerados:");
  validated.clients.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} — ${c.description}`);
  });
}

// Roda o script gerando 6 clientes
generateClients(6).catch(console.error);