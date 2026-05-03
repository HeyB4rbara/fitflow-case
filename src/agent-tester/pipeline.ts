import fs from "fs";
import path from "path";
import { config } from "dotenv";
import OpenAI from "openai";

config();

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateClients(agentPrompt, numberOfClients) {
  console.log("Gerando " + numberOfClients + " clientes ocultos...");
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Voce e um especialista em criar personas de clientes fictícios. Responda APENAS com JSON valido, sem markdown." },
      { role: "user", content: "Crie exatamente " + numberOfClients + " personas de clientes para testar este agente de vendas:\n\n" + agentPrompt + "\n\nInclua: leads animados, com objecao de preco, indecisos, com restricoes alimentares, um cetico, e um ja cliente precisando suporte.\n\nFormato: {\"clients\": [{\"name\": \"string\", \"description\": \"string\", \"prompt\": \"string\"}]" },
    ],
  });
  const parsed = JSON.parse(response.choices[0].message.content || "{}");
  return parsed.clients || [];
}

async function simulateConversation(agentPrompt, clientPrompt, initialMessage, starterRole, limit) {
  const conversation = [];
  const sellerHistory = [{ role: "system", content: agentPrompt }];
  const clientHistory = [{ role: "system", content: clientPrompt }];
  let currentSpeaker = starterRole;
  let currentMessage = initialMessage;

  for (let i = 0; i < limit; i++) {
    conversation.push({ role: currentSpeaker, message: currentMessage });
    const responderRole = currentSpeaker === "seller" ? "client" : "seller";

    if (responderRole === "seller") {
      sellerHistory.push({ role: "user", content: currentMessage });
    } else {
      clientHistory.push({ role: "user", content: currentMessage });
    }

    const historyToUse = responderRole === "seller" ? sellerHistory : clientHistory;
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: historyToUse,
    });

    const replyMessage = response.choices[0].message.content || "";

    if (responderRole === "seller") {
      sellerHistory.push({ role: "assistant", content: replyMessage });
    } else {
      clientHistory.push({ role: "assistant", content: replyMessage });
    }

    currentSpeaker = responderRole;
    currentMessage = replyMessage;
  }

  return {
    conversation,
    metadata: {
      totalMessages: conversation.length,
      sellerMessages: conversation.filter(function(m) { return m.role === "seller"; }).length,
      clientMessages: conversation.filter(function(m) { return m.role === "client"; }).length,
    },
  };
}

async function runPipeline() {
  var numberOfClients = 6;
  var limit = 10;

  const agentPrompt = fs.readFileSync(path.join(process.cwd(), "data", "agent-prompt.md"), "utf-8");
  const startTime = Date.now();
  var successful = 0;
  var failed = 0;
  const allConversations = [];

  const clients = await generateClients(agentPrompt, numberOfClients);
  console.log("Clientes gerados: " + clients.length);

  for (var i = 0; i < clients.length; i++) {
    var c = clients[i];
    console.log("\n[" + (i + 1) + "/" + clients.length + "] Simulando conversa com " + c.name + "...");

    try {
      const result = await simulateConversation(
        agentPrompt,
        c.prompt,
        "Oi, vim pelo WhatsApp, queria saber mais sobre o FitFlow",
        "client",
        limit
      );
      allConversations.push({
        client: { name: c.name, description: c.description },
        conversation: result.conversation,
        metadata: result.metadata,
        status: "success",
      });
      successful++;
      console.log("Concluido! " + result.metadata.totalMessages + " mensagens.");
    } catch (err) {
      console.error("Erro com " + c.name + ": " + err.message);
      allConversations.push({
        client: { name: c.name, description: c.description },
        conversation: [],
        metadata: { totalMessages: 0, sellerMessages: 0, clientMessages: 0 },
        status: "failed",
        error: err.message,
      });
      failed++;
    }
  }

  const finalOutput = {
    metadata: {
      totalSimulations: clients.length,
      successful: successful,
      failed: failed,
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
    },
    conversations: allConversations,
  };

  const outputPath = path.join(process.cwd(), "data", "results", "pipeline-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), "utf-8");

  console.log("\n==================================================");
  console.log("PIPELINE CONCLUIDO!");
  console.log("Simulacoes: " + successful + " ok, " + failed + " falhas");
  console.log("Arquivo salvo em: data/results/pipeline-results.json");
  console.log("Tempo total: " + Math.round((Date.now() - startTime) / 1000) + "s");
  console.log("==================================================");
}

runPipeline().catch(console.error);
