import { NextRequest } from "next/server";
import { z } from "zod";
import { fail } from "@/lib/api";
import { streamChatResponse, type ChatMessage } from "@/lib/chat/assistant";
import { getServerEnv } from "@/lib/env";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const BodySchema = z.object({
  message: z.string().trim().min(1, "Моля, въведете съобщение."),
  history: z.array(MessageSchema).max(20).optional().default([]),
});

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
