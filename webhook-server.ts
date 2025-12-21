import express from "express";
import type { Request, Response } from "express";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const PORT = Number(process.env.WEBHOOK_PORT ?? 4000);
const EVENTS_DIR = resolve(process.cwd(), "data");
const EVENTS_LOG_PATH = resolve(EVENTS_DIR, "chainhook-events.log");

function ensureDataDir() {
  if (!existsSync(EVENTS_DIR)) {
    mkdirSync(EVENTS_DIR, { recursive: true });
  }
}

ensureDataDir();

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/hooks/hello-world", (req: Request, res: Response) => {
  const eventType = req.body?.event?.type ?? "unknown";
  const blockHeight = req.body?.event?.stacks_block?.height;

  const entry = {
    receivedAt: new Date().toISOString(),
    eventType,
    blockHeight,
    payload: req.body,
  };

  appendFileSync(EVENTS_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  console.log(
    `[Chainhook] Event=${eventType} block_height=${blockHeight} saved to ${EVENTS_LOG_PATH}`
  );

  res.status(202).json({ status: "accepted" });
});

app.get("/hooks/hello-world", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message:
      "Send POST requests with Chainhook payloads to log them to data/chainhook-events.log",
  });
});

app.listen(PORT, () => {
  console.log(`Chainhook webhook server listening on http://localhost:${PORT}`);
});
