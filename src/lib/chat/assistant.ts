import Anthropic from "@anthropic-ai/sdk";
import { semanticSearch, extractFiltersFromQuery, type SemanticPropertyResult, type SemanticNeighborhoodResult } from "@/lib/search";
import { getCategoryByKeyword } from "@/lib/search/categories";
import { buildSystemPrompt } from "./prompts";
import { formatSearchContext } from "./context";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(apiKey: string): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1024;
const MAX_HISTORY = 10;
const TOP_K = 8;

/**
 * Orchestrates semantic search → context formatting → Claude streaming call.
 * Returns a ReadableStream of SSE chunks: `data: <text>\n\n` per delta,
 * terminated with `data: [DONE]\n\n`.
 */
export async function streamChatResponse(
  userMessage: string,
  history: ChatMessage[],
  siteUrl: string,
  apiKey: string
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  // 1. Extract filters and run semantic search — degrade gracefully on failure
  let properties: SemanticPropertyResult[] = [];
  let neighborhoods: SemanticNeighborhoodResult[] = [];
  try {
    const filters = extractFiltersFromQuery(userMessage);
    const categoryId = await getCategoryByKeyword(userMessage);
    const searchFilters = { ...filters, ...(categoryId ? { categoryId } : {}) };
    const result = await semanticSearch(userMessage, searchFilters, TOP_K);
    properties = result.properties;
    neighborhoods = result.neighborhoods;
  } catch (err) {
    console.error("[chat-assistant] semantic search failed, continuing without context:", err);
  }

  // 2. Build context block
  const contextBlock = formatSearchContext(properties, neighborhoods, siteUrl);

  // 3. Build message list (cap history to avoid token overflow)
  const recentHistory = history.slice(-MAX_HISTORY);
  const userMessageWithContext = contextBlock
    ? `${userMessage}\n\n---\nКонтекст от базата данни:\n${contextBlock}`
    : userMessage;

  const messages: Anthropic.MessageParam[] = [
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessageWithContext },
  ];

  // 4. Get (or initialize) the Anthropic client singleton and start streaming
  const anthropic = getAnthropicClient(apiKey);

  console.log("[chat-assistant] messages sent to Claude:", JSON.stringify(messages, null, 2));

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(siteUrl),
    messages,
  });

  // 5. Return a ReadableStream that pipes text deltas as SSE
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.delta.text)}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("[chat-assistant] stream error:", err);
        controller.enqueue(encoder.encode(`data: [ERROR]\n\n`));
      } finally {
        controller.close();
      }
    },
  });
}
