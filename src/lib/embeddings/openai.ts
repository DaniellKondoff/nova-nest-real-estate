import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to .env.local to enable embedding generation."
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

export { EMBEDDING_MODEL };
