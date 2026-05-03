import { resolve } from "node:path";
import { existsSync } from "node:fs";

import { config } from "dotenv";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const cwd = process.cwd();

if (existsSync(resolve(cwd, ".env"))) {
  config({ path: resolve(cwd, ".env") });
}
if (existsSync(resolve(cwd, "data", ".env"))) {
  config({ path: resolve(cwd, "data", ".env"), override: false });
}

async function main() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error(
      "Defina OPENAI_API_KEY em .env (na raiz do projeto ou em data/).",
    );
    process.exit(1);
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt:
      'Responda em uma única frase curta em português confirmando que a chamada funcionou.',
  });

  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
