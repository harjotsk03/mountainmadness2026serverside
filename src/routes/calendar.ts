import { Router } from "express";
import { runSync } from "../services/calendar";

const router = Router();

/**
 * Polling-style sync: call this route when you want to pull latest Google Calendar events.
 * No webhook or public URL needed. Can also be triggered by in-process polling (see server.ts).
 */
router.post("/sync", async (req, res) => {
  try {
    const { count, events } = await runSync();
    res.json({ synced: count, events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Calendar sync failed";
    console.error("[Calendar sync]", message);
    res.status(500).json({ error: message });
  }
});

export default router;
