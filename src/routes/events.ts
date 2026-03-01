import { Router } from "express";
import { supabase } from "../services/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const boardId = req.query.boardId as string;
  const user = (req as any).user;
  if (!user?.userId) return res.status(401).json({ error: "Unauthorized" });
  if (!boardId) return res.status(400).json({ error: "boardId is required" });

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.userId)
    .eq("board_id", boardId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get events of a specific type and their transactions
router.get("/by-type", async (req, res) => {
  const boardId = req.query.boardId as string;
  const type = req.query.type as string;
  const user = (req as any).user;
  if (!user?.userId) return res.status(401).json({ error: "Unauthorized" });
  if (!boardId) return res.status(400).json({ error: "boardId is required" });
  if (!type) return res.status(400).json({ error: "type is required" });

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.userId)
    .eq("board_id", boardId)
    .eq("type", type);

  if (eventsError) return res.status(500).json({ error: eventsError.message });
  if (!events?.length) return res.json({ events: [], transactions: [] });

  const eventIds = events.map((e: { id: string }) => e.id);
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .in("event_id", eventIds);

  if (txError) return res.status(500).json({ error: txError.message });
  res.json({ events, transactions: transactions ?? [] });
});

export default router;
