import fs from "fs";
import path from "path";
import { config } from "dotenv";
import OpenAI from "openai";

config();

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Coloque sua API KEY no arquivo .env");
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const agentPrompt = fs.readFileSync(
    path.join(process.cwd(), "data", "agent-prompt.md"),
    "utf-8"
  );

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: agentPrompt,
      },
      {
        role: "user",
        content: "Tem desconto?",
      },
    ],
  });

  console.log(response.choices[0].message.content);
}

main().catch(console.error);