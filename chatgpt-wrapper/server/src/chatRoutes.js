import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory metadata about the last chat request
let lastChatMeta = null;

// Middleware: require login
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

/**
 * GET /api/chat
 * - Returns a simple JSON “echo” of what will be sent to ChatGPT.
 * - This represents the "text entry" that the client wants to send.
 *   The actual call to ChatGPT is done on POST.
 *   /api/chat?message=Hello
 */
router.get("/", requireAuth, (req, res) => {
  const message = req.query.message || "";
  res.json({
    toSendToChatGPT: message,
    hint: "Send this same message via POST /api/chat to get a response.",
  });
});

/**
 * POST /api/chat
 * - Receives { message } in the body
 * - Sends it to OpenAI Chat Completions API
 * - Returns ChatGPT’s reply
 * - Updates metadata for HEAD
 */
router.post("/", requireAuth, async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const startedAt = new Date();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    }); // :contentReference[oaicite:2]{index=2}

    const reply = completion.choices[0]?.message?.content ?? "";

    const finishedAt = new Date();

    lastChatMeta = {
      ok: true,
      statusCode: 200,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt - startedAt,
      promptTokens: completion.usage?.prompt_tokens ?? null,
      completionTokens: completion.usage?.completion_tokens ?? null,
      totalTokens: completion.usage?.total_tokens ?? null,
    };

    return res.status(200).json({
      userMessage: message,
      assistantReply: reply,
    });
  } catch (err) {
    const finishedAt = new Date();

    lastChatMeta = {
      ok: false,
      statusCode: 500,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt - startedAt,
      error: err.message,
    };

    return res.status(500).json({ error: "ChatGPT request failed" });
  }
});

/**
 * HEAD /api/chat
 * - Returns metadata only in headers (no body)
 * - Includes: last request timestamp, success flag, status code, duration
 */
router.head("/", requireAuth, (req, res) => {
  if (lastChatMeta) {
    res.set("X-Chat-Ok", String(lastChatMeta.ok));
    res.set("X-Chat-StatusCode", String(lastChatMeta.statusCode));
    res.set("X-Chat-StartedAt", lastChatMeta.startedAt);
    res.set("X-Chat-FinishedAt", lastChatMeta.finishedAt);
    res.set("X-Chat-DurationMs", String(lastChatMeta.durationMs));
    if (!lastChatMeta.ok && lastChatMeta.error) {
      res.set("X-Chat-Error", lastChatMeta.error);
    }
  } else {
    res.set("X-Chat-Ok", "false");
    res.set("X-Chat-StatusCode", "0");
  }

  return res.status(200).end();
});

export default router;
