import fs from "fs";
import path from "path";
import { config } from "dotenv";
import OpenAI from "openai";

config();

async function simulateConversation(agentPrompt, clientPrompt, initialMessage, starterRole, maxMessages) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const conversation = [];
  const sellerHistory = [{ role: "system", content: agentPrompt }];
  const clientHistory = [{ role: "system", content: clientPrompt }];

  console.log("\n==================================================");
  console.log("Iniciando simulacao de conversa...");
  console.log("==================================================\n");

  let currentSpeaker = starterRole;
  let currentMessage = initialMessage;

  for (let i = 0; i < maxMessages; i++) {
    conversation.push({ role: currentSpeaker, message: currentMessage });
    console.log("[" + currentSpeaker.toUpperCase() + "]: " + currentMessage + "\n");

    const responderRole = currentSpeaker === "seller" ? "client" : "seller";

    if (responderRole === "seller") {
      sellerHistory.push({ role: "user", content: currentMessage });
    } else {
      clientHistory.push({ role: "user", content: currentMessage });
    }

    const historyToUse = responderRole === "seller" ? sellerHistory : clientHistory;

    const response = await client.chat.completions.create({
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

async function main() {
  const agentPrompt = fs.readFileSync(path.join(process.cwd(), "data", "agent-prompt.md"), "utf-8");
  const clientsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "results", "clients.json"), "utf-8"));
  const testClient = clientsData.clients[0];

  console.log("Testando com o cliente: " + testClient.name);
  console.log("Perfil: " + testClient.description);

  const result = await simulateConversation(agentPrompt, testClient.prompt, "Oi, vim pelo WhatsApp, queria saber mais sobre o FitFlow", "client", 10);

  const outputPath = path.join(process.cwd(), "data", "results", "conversation-" + testClient.name.toLowerCase() + ".json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

  console.log("\nConversa salva em: data/results/conversation-" + testClient.name.toLowerCase() + ".json");
  console.log("Total de mensagens: " + result.metadata.totalMessages);
}

main().catch(console.error);
