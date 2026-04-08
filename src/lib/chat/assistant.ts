import Anthropic from "@anthropic-ai/sdk";
import { semanticSearch, extractFiltersFromQuery } from "@/lib/search";
import { buildSystemPrompt } from "./prompts";
import { formatSearchContext } from "./context";

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

  // 1. Extract filters and run semantic search in parallel
  const filters = extractFiltersFromQuery(userMessage);
  const { properties, neighborhoods } = await semanticSearch(userMessage, filters, TOP_K);

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

  // 4. Create Anthropic client and start streaming
  const anthropic = new Anthropic({ apiKey });

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
