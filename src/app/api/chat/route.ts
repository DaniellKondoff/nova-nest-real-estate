import { NextRequest } from "next/server";
import { z } from "zod";
import { fail } from "@/lib/api";
import { streamChatResponse, type ChatMessage } from "@/lib/chat/assistant";
import { getServerEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/chat/rate-limit";

// Hard caps keep a single request from pushing a huge prompt to Anthropic (the widget sends ≤500 chars, last 10 turns)
const MAX_MESSAGE_CHARS = 1000;
const MAX_ASSISTANT_CHARS = 6000; // answers are capped at 1024 tokens (≈ 4–5k Cyrillic chars)
const MAX_TOTAL_CHARS = 20_000;

const MessageSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: z.string().min(1).max(MAX_MESSAGE_CHARS) }),
  z.object({ role: z.literal("assistant"), content: z.string().min(1).max(MAX_ASSISTANT_CHARS) }),
]);

const BodySchema = z
  .object({
    message: z.string().trim().min(1, "Моля, въведете съобщение.").max(MAX_MESSAGE_CHARS),
    history: z.array(MessageSchema).max(12).optional().default([]),
  })
  .refine(
    ({ message, history }) => history.reduce((sum, m) => sum + m.content.length, message.length) <= MAX_TOTAL_CHARS,
    { message: "Разговорът е твърде дълъг." }
  );

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Невалидно JSON тяло.", { status: 400, code: "INVALID_JSON" });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail("Невалидни параметри.", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { issues: parsed.error.issues },
    });
  }

  const { message, history } = parsed.data;

  // x-real-ip is set by the platform (Vercel); x-forwarded-for's first entry can be spoofed by the client
  const ip =
    req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return fail("Твърде много заявки. Моля, изчакайте малко.", {
      status: 429,
      code: "RATE_LIMITED",
      details: { retryAfter: rl.retryAfter },
    });
  }

  const serverEnv = getServerEnv();
  const apiKey = serverEnv.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fail("AI асистентът не е конфигуриран.", { status: 503, code: "SERVICE_UNAVAILABLE" });
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://novanest.bg";

  try {
    const stream = await streamChatResponse(
      message,
      history as ChatMessage[],
      siteUrl,
      apiKey
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[chat-route] unexpected error:", err);
    return fail("Грешка при обработка на съобщението.", { status: 500, code: "SERVER_ERROR" });
  }
}
